import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveGameProgress(playerData) {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .upsert({
        player_id: playerData.id,
        current_room: playerData.currentRoom,
        collected_items: playerData.collectedItems,
        unlocked_doors: playerData.unlockedDoors,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving game:', error);
    return { success: false, error };
  }
}

export async function loadGameProgress(playerId) {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('*')
      .eq('player_id', playerId)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error loading game:', error);
    return { success: false, error };
  }
}

export async function saveHighScore(playerData) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        player_name: playerData.name,
        completion_time: playerData.time,
        items_collected: playerData.items,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving high score:', error);
    return { success: false, error };
  }
}

export async function getLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('completion_time', { ascending: true })
      .limit(10);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { success: false, error };
  }
}
