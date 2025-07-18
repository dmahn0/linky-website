// Supabase Client Configuration for Linky Platform
// Drop-in replacement for Firebase functions

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'https://mzihuflrbspvyjknxlad.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aWh1ZmxyYnNwdnlqa254bGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTk3ODgsImV4cCI6MjA2ODM5NTc4OH0.UDwv6eknjWwmbZ9WsRioi3J23_1az9O1pJFlnKgQ88s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth wrapper functions (Firebase compatibility layer)
export const auth = {
  // Sign up
  createUserWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign in
  signInWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  currentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Auth state change listener
  onAuthStateChanged: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }
};

// Database wrapper functions (Firestore compatibility layer)
export const db = {
  // Users collection
  users: {
    // Get user by ID
    get: async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Create user
    create: async (userId, userData) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          uid: userId,
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update user
    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('uid', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // List users with filters
    list: async (filters = {}) => {
      let query = supabase.from('users').select('*');
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  },

  // Spaces collection
  spaces: {
    // Get space by ID
    get: async (spaceId) => {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Create space
    create: async (spaceData) => {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          ...spaceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update space
    update: async (spaceId, updates) => {
      const { data, error } = await supabase
        .from('spaces')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', spaceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // List spaces for owner
    listByOwner: async (ownerId) => {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('uid', ownerId)
        .single();
      
      if (!user) throw new Error('User not found');
      
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  },

  // Jobs collection
  jobs: {
    // Create job
    create: async (jobData) => {
      // Generate job ID
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const jobId = `JOB-${dateStr}-${random}`;
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          job_id: jobId,
          ...jobData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update job
    update: async (jobId, updates) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Get jobs for business
    listByBusiness: async (businessId) => {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('uid', businessId)
        .single();
      
      if (!user) throw new Error('User not found');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          spaces (name, address),
          partner:users!jobs_partner_id_fkey (name, phone)
        `)
        .eq('business_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Get jobs for partner
    listByPartner: async (partnerId) => {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('uid', partnerId)
        .single();
      
      if (!user) throw new Error('User not found');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          spaces (name, address),
          business:users!jobs_business_id_fkey (name, business)
        `)
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Get available jobs for partners
    listAvailable: async (area) => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          spaces (name, address),
          business:users!jobs_business_id_fkey (name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (area) {
        query = query.eq('spaces.address->sigungu', area);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  }
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to job changes
  subscribeToJobs: (callback) => {
    const subscription = supabase
      .channel('jobs-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
    
    return () => supabase.removeChannel(subscription);
  },

  // Subscribe to specific job
  subscribeToJob: (jobId, callback) => {
    const subscription = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
    
    return () => supabase.removeChannel(subscription);
  }
};

// Storage functions
export const storage = {
  // Upload file
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl;
  },

  // Delete file
  delete: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
};

// Helper functions
export const helpers = {
  // Convert Firebase timestamp to date
  timestampToDate: (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp);
  },

  // Format date for display
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR');
  },

  // Format time for display
  formatTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
};

export default supabase;