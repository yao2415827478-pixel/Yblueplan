// 前端 API 配置
// 所有后端接口都通过统一的 BASE_URL 访问

// 从 Vite 环境变量读取 API 地址，开发环境默认指向本地后端
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export { API_BASE_URL }

export default {
  API_BASE_URL
}
