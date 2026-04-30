import { supabase } from './supabase';
import type {
    RazorpayCheckoutOptions,
    RazorpayPaymentSuccessResponse,
} from '../types/razorpay';
import type { ListingType } from './platform';

const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpaySdkPromise: Promise<void> | null = null;

const loadRazorpaySdk = async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.Razorpay) return;
    if (razorpaySdkPromise) return razorpaySdkPromise;

    razorpaySdkPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SDK_URL}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout SDK.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = RAZORPAY_SDK_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay checkout SDK.'));
        document.body.appendChild(script);
    });

    await razorpaySdkPromise;
};

export interface BookingPaymentDraft {
    listing_id: string;
    listing_type: ListingType;
    provider_user_id?: string | null;
    listing_title: string;
    listing_image: string;
    number_of_people: number;
    unit_price: number;
    total_price: number;
    booking_date?: string | null;
}

export interface RazorpayOrderPayload {
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
}

export interface RazorpayCheckoutPrefill {
    name?: string;
    email?: string;
    contact?: string;
}

export const createRazorpayOrder = async (booking: BookingPaymentDraft): Promise<RazorpayOrderPayload> => {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
            ...booking,
            currency: 'INR',
        },
    });

    if (error) {
        throw new Error(error.message || 'Could not create payment order.');
    }

    const payload = data as Partial<RazorpayOrderPayload> | null;
    if (!payload?.order_id || !payload?.key_id || typeof payload.amount !== 'number' || !payload.currency) {
        throw new Error('Invalid payment order response from backend.');
    }

    return {
        order_id: payload.order_id,
        amount: payload.amount,
        currency: payload.currency,
        key_id: payload.key_id,
    };
};

export interface ConfirmRazorpayBookingInput {
    booking: BookingPaymentDraft;
    payment: RazorpayPaymentSuccessResponse;
}

export interface ConfirmRazorpayBookingResult {
    booking_id: string;
}

export const confirmRazorpayBooking = async (
    input: ConfirmRazorpayBookingInput
): Promise<ConfirmRazorpayBookingResult> => {
    const { data, error } = await supabase.functions.invoke('confirm-razorpay-booking', {
        body: input,
    });

    if (error) {
        throw new Error(error.message || 'Payment verification failed.');
    }

    const payload = data as Partial<ConfirmRazorpayBookingResult> | null;
    if (!payload?.booking_id) {
        throw new Error('Booking confirmation response is missing booking_id.');
    }

    return { booking_id: payload.booking_id };
};

interface OpenCheckoutInput {
    order: RazorpayOrderPayload;
    booking: BookingPaymentDraft;
    prefill?: RazorpayCheckoutPrefill;
}

export const openRazorpayCheckout = async (
    input: OpenCheckoutInput
): Promise<RazorpayPaymentSuccessResponse> => {
    await loadRazorpaySdk();

    if (!window.Razorpay) {
        throw new Error('Razorpay checkout SDK is unavailable.');
    }
    const RazorpayCheckout = window.Razorpay;

    return new Promise<RazorpayPaymentSuccessResponse>((resolve, reject) => {
        let settled = false;
        const safeResolve = (value: RazorpayPaymentSuccessResponse) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };
        const safeReject = (error: Error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        const options: RazorpayCheckoutOptions = {
            key: input.order.key_id,
            amount: input.order.amount,
            currency: input.order.currency,
            name: 'The Better Pass',
            description: `Booking for ${input.booking.listing_title}`,
            order_id: input.order.order_id,
            prefill: input.prefill,
            notes: {
                listing_id: input.booking.listing_id,
                listing_type: input.booking.listing_type,
                booking_date: input.booking.booking_date || '',
            },
            theme: { color: '#1769ff' },
            modal: {
                ondismiss: () => safeReject(new Error('Payment was cancelled.')),
            },
            handler: (response) => safeResolve(response),
        };

        const checkout = new RazorpayCheckout(options);
        checkout.on('payment.failed', (response) => {
            const description = response?.error?.description || response?.error?.reason || 'Payment failed.';
            safeReject(new Error(description));
        });
        checkout.open();
    });
};
