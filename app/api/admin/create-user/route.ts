import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Rota executada apenas no servidor - nunca exposta no browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, nome, role, telas_permitidas, userId } = body;

    if (action === 'create') {
      // 1. Cria o usuário no Auth com senha padrão GWEP@123
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: 'GWEP@123',
        email_confirm: true,
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      // 2. Cria o perfil na tabela perfis (com service role = ignora RLS)
      const { data: perfilData, error: perfilError } = await supabaseAdmin
        .from('perfis')
        .insert([{ nome, email, role, telas_permitidas, must_change_password: true }])
        .select()
        .single();

      if (perfilError) {
        // Se falhar, apaga o auth user para não deixar órfão
        if (authData?.user?.id) {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        }
        return NextResponse.json({ error: 'Erro ao salvar perfil: ' + perfilError.message }, { status: 400 });
      }

      return NextResponse.json({ perfil: perfilData });
    }

    if (action === 'reset') {
      // Busca o usuário no Auth pelo email para obter o UUID
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) return NextResponse.json({ error: listError.message }, { status: 400 });

      const authUser = users.find((u: any) => u.email === body.email);
      if (!authUser) return NextResponse.json({ error: 'Usuário não encontrado no Auth' }, { status: 404 });

      // Reseta a senha
      const { error } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: 'GWEP@123',
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      // Marca must_change_password = true no perfil
      await supabaseAdmin.from('perfis').update({ must_change_password: true }).eq('email', body.email);

      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      // Busca o auth user pelo email
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = users.find((u: any) => u.email === body.email);
      if (authUser) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
