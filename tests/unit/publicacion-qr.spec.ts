import { describe, expect, test } from 'vitest';

import { leerPublicacionQr } from '@/qr/publicacion';

const usuarios = [
  { id: 3, name: 'Ana Castro' },
  { id: 17, name: 'Sara Díaz' },
];

describe('leerPublicacionQr', () => {
  test('rellena los campos con el texto del QR del profesor', () => {
    const qr = 'Title: Probando Ionic y capacitor\nBody: una prueba de ionic y capacitor\nUser: 1';
    expect(leerPublicacionQr(qr, [{ id: 1, name: 'Leanne Graham' }])).toEqual({
      title: 'Probando Ionic y capacitor',
      body: 'una prueba de ionic y capacitor',
      userId: 1,
    });
  });

  test('conserva los párrafos y reconoce los saltos de línea de Windows', () => {
    const qr = 'Title: Aviso\r\nBody: Primera línea\r\n\r\nHora: 10:30\r\nUser: 17';
    expect(leerPublicacionQr(qr, usuarios)).toEqual({
      title: 'Aviso',
      body: 'Primera línea\r\n\r\nHora: 10:30',
      userId: 17,
    });
  });

  test('valida al usuario también en el formato de tres líneas', () => {
    expect(() => leerPublicacionQr('Title: Aviso\nBody: Texto\nUser: 99', usuarios)).toThrow(/usuario de la lista/);
  });

  test('conserva el ID de la API aunque no coincida con la posición en la lista', () => {
    const qr = JSON.stringify({ title: ' Aviso ', body: ' Para el grupo ', userId: 17 });
    expect(leerPublicacionQr(qr, usuarios)).toEqual({ title: 'Aviso', body: 'Para el grupo', userId: 17 });
  });

  test.each([{ usuarioId: '17' }, { usuario: 17 }, { usuario: 'Sara Díaz' }])(
    'reconoce los campos en español y resuelve la referencia %o',
    (referencia) => {
      const qr = JSON.stringify({ titulo: 'Aviso', contenido: 'Para el grupo', ...referencia });
      expect(leerPublicacionQr(qr, usuarios)).toEqual({ title: 'Aviso', body: 'Para el grupo', userId: 17 });
    },
  );

  test.each(['https://ejemplo.com/', 'null', '[]', '{"titulo":"Solo título"}'])(
    'rechaza el contenido inválido %s',
    (texto) => {
      expect(() => leerPublicacionQr(texto, usuarios)).toThrow();
    },
  );

  test.each([{ title: ' ' }, { body: 5 }, { userId: true }, { userId: 99 }, { userId: 'Ana Castro' }])(
    'rechaza el campo inválido %o',
    (campo) => {
      const qr = JSON.stringify({ title: 'Aviso', body: 'Texto', userId: 17, ...campo });
      expect(() => leerPublicacionQr(qr, usuarios)).toThrow();
    },
  );

  test('rechaza un nombre compartido por varios usuarios', () => {
    const qr = JSON.stringify({ title: 'Aviso', body: 'Texto', usuario: 'Sara Díaz' });
    expect(() => leerPublicacionQr(qr, [...usuarios, { id: 42, name: 'Sara Díaz' }])).toThrow();
  });
});
