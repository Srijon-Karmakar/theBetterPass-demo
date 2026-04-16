import { supabase } from './supabase';

export interface Destination {
    id: string;
    title: string;
    location: string;
    price: number;
    rating?: number;
    image_url: string;
    description: string;
    category: string;
    user_id: string;
}

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    profile_image_url: string;
    bio: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    role?: string;
    is_verified?: boolean;
}

// Supabase API Methods
export const getActivities = async () => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
    return data as Destination[];
};

export const getTours = async () => {
    const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tours:', error);
        return [];
    }
    return data as Destination[];
};

export const getDestinationById = async (id: string) => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching activity:', error);
        return null;
    }
    return data as Destination;
};

export const createBooking = async (booking: {
    user_id: string;
    activity_id: string;
    number_of_people: number;
    price: number;
    total_price: number;
    status?: string;
}) => {
    const { data, error } = await supabase
        .from('bookings_acts')
        .insert([booking])
        .select();

    if (error) throw error;
    return data;
};

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data as Profile;
};

export const updateProfile = async (profile: Partial<Profile>) => {
    if (!profile.id) return null;
    const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id)
        .select();

    if (error) throw error;
    return data;
};

export interface BookingWithDetails {
    id: string;
    activity_id: string;
    number_of_people: number;
    price: number;
    total_price: number;
    status: string;
    created_at: string;
    activity_title: string;
    activity_image: string;
}

export const getBookings = async (userId: string): Promise<BookingWithDetails[]> => {
    const { data, error } = await supabase
        .from('bookings_acts')
        .select(`
            id,
            activity_id,
            number_of_people,
            price,
            total_price,
            status,
            created_at,
            activities:activity_id (
                title,
                image_url
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }

    // Flatten the activity details into the booking object
    return (data as any[]).map(booking => ({
        ...booking,
        activity_title: booking.activities?.title || 'Unknown Experience',
        activity_image: booking.activities?.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'
    }));
};
