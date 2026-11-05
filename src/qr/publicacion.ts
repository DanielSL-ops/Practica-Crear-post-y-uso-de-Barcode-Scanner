import type { Usuarios } from '@/interfaces/usuarios';

export function leerPublicacionQr(
  texto: string,
  usuarios: readonly Pick<Usuarios, 'id' | 'name'>[],
): { title: string; body: string; userId: number } {
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    const campos = /^Title:(.*)\r?\nBody:([\s\S]*?)\r?\nUser:(.*)$/i.exec(texto.trim());
    if (!campos) {
      throw new Error('El QR debe contener una publicación en JSON o las líneas Title, Body y User.');
    }
    const [, title, body, usuario] = campos;
    valor = { title, body, usuario };
  }
  if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new Error('El QR debe contener un objeto de publicación.');
  }

  const datos = valor as Record<string, unknown>;
  const title = datos.title ?? datos.titulo;
  const body = datos.body ?? datos.contenido;
  if (typeof title !== 'string' || !title.trim() || typeof body !== 'string' || !body.trim()) {
    throw new Error('El QR debe incluir un título y un contenido de texto.');
  }

  const id = datos.userId ?? datos.usuarioId;
  const referencia = id ?? datos.usuario;
  const usuario = typeof referencia === 'string' ? referencia.trim() : referencia;
  let coincidencias: Pick<Usuarios, 'id' | 'name'>[] = [];
  if (typeof usuario === 'number' || (typeof usuario === 'string' && /^\d+$/.test(usuario))) {
    const numero = Number(usuario);
    coincidencias = usuarios.filter((persona) => Number.isSafeInteger(numero) && persona.id === numero);
  } else if (id == null && typeof usuario === 'string' && usuario) {
    coincidencias = usuarios.filter((persona) => persona.name === usuario);
  }
  if (coincidencias.length !== 1) {
    throw new Error('El QR debe identificar a un usuario de la lista por su ID o nombre completo.');
  }

  return { title: title.trim(), body: body.trim(), userId: coincidencias[0].id };
}
