const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Add this line!

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;