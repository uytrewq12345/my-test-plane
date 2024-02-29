import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  const data = await response.buffer();
  await writeFile(outputPath, data);
  console.log(`File has been downloaded and saved to ${outputPath}`);
}
