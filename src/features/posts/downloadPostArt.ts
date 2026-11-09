/** A blob URL makes download work for hosted artwork as well as data URLs. */
export async function downloadPostArt(imageUrl: string, filename: string): Promise<void> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Não foi possível baixar a arte. Tente novamente.');
  const blob = await response.blob();
  if (!blob.type.startsWith('image/')) throw new Error('O arquivo da arte não está disponível como imagem.');
  const extension = blob.type === 'image/jpeg' ? '.jpg' : blob.type === 'image/webp' ? '.webp' : '.png';
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename.replace(/\.(?:png|jpe?g|webp)$/i, extension);
  document.body.appendChild(link);
  try { link.click(); }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); }
}
