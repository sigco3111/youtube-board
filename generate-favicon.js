// SVG를 PNG로 변환하고 다양한 크기의 파비콘 생성하는 스크립트
// 이 스크립트는 svg를 읽어서 Canvas에 렌더링하고 PNG로 저장합니다.

import fs from 'fs';
import { createCanvas } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG 파일 읽기
const svgString = fs.readFileSync(path.join(__dirname, 'favicon.svg'), 'utf-8');

// 다양한 크기로 PNG 생성
const sizes = [16, 32, 180, 192, 512];
const outputFileNames = {
  16: 'favicon-16x16.png',
  32: 'favicon-32x32.png',
  180: 'apple-touch-icon.png',
  192: 'android-chrome-192x192.png',
  512: 'android-chrome-512x512.png'
};

// 각 크기별로 PNG 생성
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 배경색 설정 (#1e293b)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);
  
  // 모서리 라운딩 (크기에 비례)
  const radius = size * 0.125; // 4px for 32px size
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();
  
  // 재생 버튼 삼각형 그리기
  ctx.fillStyle = '#e11d48';
  const triangleScale = size / 32;
  ctx.beginPath();
  ctx.moveTo(12 * triangleScale, 8 * triangleScale);
  ctx.lineTo(24 * triangleScale, 16 * triangleScale);
  ctx.lineTo(12 * triangleScale, 24 * triangleScale);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = triangleScale;
  ctx.stroke();
  
  // 차트 요소 그리기
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(4 * triangleScale, 18 * triangleScale, 3 * triangleScale, 8 * triangleScale);
  
  ctx.fillStyle = '#34d399';
  ctx.fillRect(8 * triangleScale, 14 * triangleScale, 3 * triangleScale, 12 * triangleScale);
  
  // PNG로 저장
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, outputFileNames[size]), buffer);
  
  console.log(`Generated ${outputFileNames[size]}`);
});

// favicon.ico 파일 생성 (16x16 및 32x32 결합)
console.log('All favicon images generated successfully!'); 