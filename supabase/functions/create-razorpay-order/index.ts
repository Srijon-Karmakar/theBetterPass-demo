/// <reference path="../_types/deno-fallback.d.ts" />
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';

const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (status: number, payload: unknown): Response => (
    new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    })
);

interface CreateOrderBody {
    listing_id?: string;
    listing_type?: string;
    listing_title?: string;
    number_of_people?: number;
    unit_price?: number;
    total_price?: number;
    booking_date?: string | null;
    currency?: string;
}

const toPositiveNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return null;
};

const normalizeInteger = (value: unknown, fallback = 1): number => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
    return fallback;
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
    if (error || !data.user) {
        throw new Error('Unauthorized');
    }

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
        const body = (await req.json()) as CreateOrderBody;

        const listingId = typeof body.listing_id === 'string' ? body.listing_id.trim() : '';
        const listingType = typeof body.listing_type === 'string' ? body.listing_type.trim() : '';
        const listingTitle = typeof body.listing_title === 'string' ? body.listing_title.trim() : '';
        const totalPrice = toPositiveNumber(body.total_price);
        const unitPrice = toPositiveNumber(body.unit_price);
        const numberOfPeople = normalizeInteger(body.number_of_people, 1);
        const currency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : 'INR';

        if (!listingId || !listingType || !listingTitle) {
            return jsonResponse(400, { error: 'listing_id, listing_type, and listing_title are required.' });
        }
        if (!totalPrice || !unitPrice) {
            return jsonResponse(400, { error: 'unit_price and total_price must be positive numbers.' });
        }
        if (currency !== 'INR') {
            return jsonResponse(400, { error: 'Only INR currency is supported.' });
        }

        const amountInPaise = Math.round(totalPrice * 100);
        if (amountInPaise <= 0) {
            return jsonResponse(400, { error: 'total_price must be greater than zero.' });
        }

        const razorpayKeyId = ensureEnv('RAZORPAY_KEY_ID');
        const razorpayKeySecret = ensureEnv('RAZORPAY_KEY_SECRET');
        const basicToken = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

        const receiptId = `tbp_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
        const orderPayload = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            notes: {
                user_id: user.id,
                listing_id: listingId,
                listing_type: listingType,
                listing_title: listingTitle.slice(0, 40),
                number_of_people: String(numberOfPeople),
                unit_price: String(unitPrice),
                booking_date: body.booking_date || '',
            },
        };

        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basicToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload),
        });

        const responseText = await razorpayResponse.text();
        let responseJson: Record<string, unknown> = {};
        try {
            responseJson = responseText ? JSON.parse(responseText) as Record<string, unknown> : {};
        } catch {
            responseJson = {};
        }

        if (!razorpayResponse.ok) {
            const apiMessage = typeof responseJson?.error === 'object'
                ? String((responseJson.error as Record<string, unknown>).description || 'Razorpay order creation failed.')
                : 'Razorpay order creation failed.';
            return jsonResponse(502, { error: apiMessage });
        }

        return jsonResponse(200, {
            order_id: responseJson.id,
            amount: responseJson.amount,
            currency: responseJson.currency,
            key_id: razorpayKeyId,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return jsonResponse(401, { error: 'Unauthorized' });
        }
        const message = error instanceof Error ? error.message : 'Internal server error';
        return jsonResponse(500, { error: message });
    }
});
