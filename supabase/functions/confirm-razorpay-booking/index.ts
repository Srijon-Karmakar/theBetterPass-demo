import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { hmacSha256Hex } from '../_shared/hmac.ts';
import { corsHeaders, jsonResponse } from '../_shared/http.ts';

type ListingType = 'tour' | 'activity' | 'guide';

interface BookingPayload {
    listing_id?: string;
    listing_type?: ListingType;
    provider_user_id?: string | null;
    listing_title?: string;
    listing_image?: string;
    number_of_people?: number;
    unit_price?: number;
    total_price?: number;
    booking_date?: string | null;
}

interface PaymentPayload {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
}

interface ConfirmBody {
    booking?: BookingPayload;
    payment?: PaymentPayload;
}

const toPositiveNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return null;
};

const normalizePeopleCount = (value: unknown): number => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
    return 1;
};

const ensureEnv = (name: string): string => {
    const value = Deno.env.get(name)?.trim();
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
};

const authenticateUser = async (authHeader: string) => {
    const supabaseUrl = ensureEnv('SUPABASE_URL');
    const supabaseAnonKey = ensureEnv('SUPABASE_ANON_KEY');
    const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
    });

    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new Error('Unauthorized');
    return data.user;
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return jsonResponse(401, { error: 'Missing Authorization header.' });

        const user = await authenticateUser(authHeader);
        const body = (await req.json()) as ConfirmBody;
        const booking = body.booking;
        const payment = body.payment;

        const listingId = typeof booking?.listing_id === 'string' ? booking.listing_id.trim() : '';
        const listingType = booking?.listing_type;
        const listingTitle = typeof booking?.listing_title === 'string' ? booking.listing_title.trim() : '';
        const listingImage = typeof booking?.listing_image === 'string' ? booking.listing_image.trim() : '';
        const providerUserId = typeof booking?.provider_user_id === 'string'
            ? booking.provider_user_id.trim()
            : null;
        const numberOfPeople = normalizePeopleCount(booking?.number_of_people);
        const unitPrice = toPositiveNumber(booking?.unit_price);
        const totalPrice = toPositiveNumber(booking?.total_price);
        const bookingDate = typeof booking?.booking_date === 'string' && booking.booking_date.trim()
            ? booking.booking_date.trim()
            : null;

        const orderId = typeof payment?.razorpay_order_id === 'string' ? payment.razorpay_order_id.trim() : '';
        const paymentId = typeof payment?.razorpay_payment_id === 'string' ? payment.razorpay_payment_id.trim() : '';
        const signature = typeof payment?.razorpay_signature === 'string' ? payment.razorpay_signature.trim() : '';

        if (!listingId || !listingType || !listingTitle) {
            return jsonResponse(400, { error: 'Booking data is incomplete.' });
        }
        if (listingType !== 'tour' && listingType !== 'activity' && listingType !== 'guide') {
            return jsonResponse(400, { error: 'Invalid listing_type.' });
        }
        if (!unitPrice || !totalPrice) {
            return jsonResponse(400, { error: 'Invalid booking amount.' });
        }
        if (!orderId || !paymentId || !signature) {
            return jsonResponse(400, { error: 'Payment data is incomplete.' });
        }

        const razorpaySecret = ensureEnv('RAZORPAY_KEY_SECRET');
        const signedPayload = `${orderId}|${paymentId}`;
        const expectedSignature = await hmacSha256Hex(razorpaySecret, signedPayload);
        if (expectedSignature !== signature) {
            return jsonResponse(400, { error: 'Payment signature verification failed.' });
        }

        const supabaseUrl = ensureEnv('SUPABASE_URL');
        const serviceRoleKey = ensureEnv('SUPABASE_SERVICE_ROLE_KEY');
        const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        });

        const existingLookup = await admin
            .from('bookings')
            .select('id')
            .eq('payment_id', paymentId)
            .maybeSingle();

        if (!existingLookup.error && existingLookup.data?.id) {
            return jsonResponse(200, { booking_id: existingLookup.data.id });
        }

        const bookingInsert = await admin
            .from('bookings')
            .insert([{
                user_id: user.id,
                provider_user_id: providerUserId || null,
                listing_id: listingId,
                listing_type: listingType,
                listing_title: listingTitle,
                listing_image: listingImage || null,
                number_of_people: numberOfPeople,
                unit_price: unitPrice,
                total_price: totalPrice,
                status: 'confirmed',
                payment_status: 'paid',
                payment_order_id: orderId,
                payment_id: paymentId,
                payment_signature: signature,
                payment_currency: 'INR',
                paid_at: new Date().toISOString(),
                booking_date: bookingDate,
            }])
            .select('id')
            .maybeSingle();

        if (bookingInsert.error || !bookingInsert.data?.id) {
            const message = bookingInsert.error?.message || 'Booking insert failed.';
            return jsonResponse(500, { error: message });
        }

        return jsonResponse(200, {
            booking_id: bookingInsert.data.id,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return jsonResponse(401, { error: 'Unauthorized' });
        }
        const message = error instanceof Error ? error.message : 'Internal server error';
        return jsonResponse(500, { error: message });
    }
});
