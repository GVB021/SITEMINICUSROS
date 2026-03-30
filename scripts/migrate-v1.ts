#!/usr/bin/env ts-node
// @ts-nocheck

/**
 * Script de migração de dados da V1 para V2
 * 
 * Lê os cursos de ../src/data/courses.ts e insere no Supabase
 * 
 * Uso: npm run migrate
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carregar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para carregar cursos da V1
function loadV1Courses() {
  const v1Path = path.join(__dirname, '../../src/data');
  const courseFiles = [
    'courses.ts',
    'coursesPart2.ts',
    'coursesPart3.ts',
    'coursesPart4.ts',
    'coursesPart5.ts',
    'coursesPart6.ts',
    'coursesPart7.ts',
  ];
  
  // NOTA: Este é um placeholder
  // Na prática, você precisaria fazer require() dinâmico ou parse do TypeScript
  console.log('📚 Carregando cursos da V1...');
  console.log(`Procurando em: ${v1Path}`);
  
  // Retornar array vazio por enquanto
  // O usuário precisará adaptar este script para seu caso
  return [];
}

function convertCategory(category: string): string {
  const map: Record<string, string> = {
    'Dublagem': 'DUBLAGEM',
    'Fonoaudiologia': 'FONOAUDIOLOGIA',
    'Carreira': 'CARREIRA',
  };
  return map[category] || 'DUBLAGEM';
}

function convertLevel(level: string): string {
  const map: Record<string, string> = {
    'Iniciante': 'INICIANTE',
    'Intermediário': 'INTERMEDIARIO',
    'Avançado': 'AVANCADO',
    'Todos os níveis': 'TODOS_NIVEIS',
  };
  return map[level] || 'TODOS_NIVEIS';
}

function convertMediaType(mediaType: string): string {
  return mediaType.toUpperCase();
}

function createSlug(title: string, id: string): string {
  // Usar o ID original como slug por compatibilidade
  return id;
}

async function migrate() {
  console.log('🚀 Iniciando migração V1 → V2');
  console.log('');
  
  // Carregar cursos (placeholder - você precisa implementar a lógica real)
  const v1Courses = loadV1Courses();
  
  if (v1Courses.length === 0) {
    console.log('⚠️  AVISO: Script de migração precisa ser adaptado!');
    console.log('');
    console.log('Este script é um template. Para migrar seus dados:');
    console.log('1. Adapte a função loadV1Courses() para carregar seus dados');
    console.log('2. Ou use a migração manual via SQL');
    console.log('');
    console.log('Exemplo de migração manual no Supabase SQL Editor:');
    console.log('');
    console.log('INSERT INTO courses (slug, title, description, category, level, image_url)');
    console.log("VALUES ('curso-1', 'Meu Curso', 'Descrição', 'DUBLAGEM', 'INICIANTE', 'https://...');");
    console.log('');
    return;
  }
  
  console.log(`📦 ${v1Courses.length} cursos encontrados`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const course of v1Courses) {
    try {
      // Inserir curso
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          slug: createSlug(course.title, course.id),
          title: course.title,
          description: course.description,
          category: convertCategory(course.category),
          level: convertLevel(course.level),
          image_url: course.imageUrl,
          published: true,
        })
        .select()
        .single();
      
      if (courseError) {
        console.error(`❌ Erro ao criar curso "${course.title}":`, courseError.message);
        errorCount++;
        continue;
      }
      
      console.log(`✅ Curso criado: ${course.title}`);
      
      // Inserir aulas
      if (course.lessons && course.lessons.length > 0) {
        for (let i = 0; i < course.lessons.length; i++) {
          const lesson = course.lessons[i];
          
          const { error: lessonError } = await supabase
            .from('lessons')
            .insert({
              course_id: newCourse.id,
              title: lesson.title,
              content: lesson.content,
              duration: lesson.duration,
              media_type: convertMediaType(lesson.mediaType),
              slide_bg_url: lesson.slideBgUrl || null,
              order: i,
            });
          
          if (lessonError) {
            console.error(`   ❌ Erro na aula "${lesson.title}":`, lessonError.message);
          } else {
            console.log(`   ✓ Aula ${i + 1}/${course.lessons.length}: ${lesson.title}`);
          }
        }
      }
      
      successCount++;
      console.log('');
      
    } catch (error) {
      console.error(`❌ Erro inesperado no curso "${course.title}":`, error);
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Resumo da Migração');
  console.log('━'.repeat(50));
  console.log(`✅ Sucesso: ${successCount} cursos`);
  console.log(`❌ Erros:   ${errorCount} cursos`);
  console.log('━'.repeat(50));
  console.log('');
  
  if (successCount > 0) {
    console.log('🎉 Migração concluída! Acesse o Supabase para verificar.');
  }
}

// Executar migração
migrate().catch((error) => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
