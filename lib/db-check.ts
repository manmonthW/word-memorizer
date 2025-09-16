// 检查数据库状态的工具函数
export async function checkDatabaseConnection(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    // 客户端环境
    return false;
  }
  
  try {
    const database = require('./database').default;
    const result = await database.get('SELECT 1 as test');
    return result?.test === 1;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export function isDatabaseAvailable(): boolean {
  return typeof window === 'undefined';
}