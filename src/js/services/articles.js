import { supabase } from '../supabase.js';

export async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getArticleById(articleId) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createArticle(article) {
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
