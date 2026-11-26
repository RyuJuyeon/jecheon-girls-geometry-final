import fs from 'node:fs';
import {chromium} from 'playwright';
export async function browser(){const paths=[process.env.CHROME_PATH,...(process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']:[])].filter(Boolean);const executablePath=paths.find(p=>fs.existsSync(p));return chromium.launch({headless:true,...(executablePath?{executablePath}:{})});}
