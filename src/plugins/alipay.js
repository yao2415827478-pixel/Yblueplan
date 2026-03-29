// 支付宝 App 支付插件封装
// 用于在 App 中调用支付宝进行支付

/**
 * 调试日志 - 仅控制台输出，不弹窗
 */
const debugLog = (msg, data) => {
  const logMsg = `[Alipay] ${msg}`
  console.log(logMsg, data || '')
}

/**
 * 获取 Capacitor 实例
 */
const getCapacitor = () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    return window.Capacitor
  }
  return null
}

/**
 * 创建支付宝插件调用 - 使用底层invoke方法
 */
const createAlipayBridge = () => {
  const cap = getCapacitor()
  if (!cap) return null

  // 检查是否有原生插件桥接
  if (!cap.nativePromise) {
    debugLog('❌ nativePromise 不可用')
    return null
  }

  // 创建一个桥接对象，使用Capacitor的底层调用
  return {
    pay: async (options) => {
      debugLog('通过原生桥调用 pay')
      try {
        // 使用Capacitor的底层调用方式
        const result = await cap.nativePromise('AlipayPlugin', 'pay', options)
        debugLog('pay 调用成功', result)
        return result
      } catch (error) {
        debugLog('pay 调用失败', error)
        throw error
      }
    },
    isAlipayInstalled: async () => {
      try {
        const result = await cap.nativePromise('AlipayPlugin', 'isAlipayInstalled', {})
        return result
      } catch (error) {
        return { installed: false }
      }
    },
    auth: async (options) => {
      try {
        const result = await cap.nativePromise('AlipayPlugin', 'auth', options)
        return result
      } catch (error) {
        throw error
      }
    }
  }
}

/**
 * 获取支付宝插件 - 多种方式尝试
 */
const getAlipayPlugin = () => {
  const cap = getCapacitor()
  
  if (!cap) {
    debugLog('❌ window.Capacitor 不存在')
    return null
  }
  
  debugLog('✅ window.Capacitor 存在', { 
    isNative: cap.isNativePlatform(),
    platform: cap.getPlatform?.(),
    hasNativePromise: !!cap.nativePromise
  })

  // 方式1: 直接访问 Plugins.AlipayPlugin
  if (cap.Plugins) {
    const pluginNames = Object.keys(cap.Plugins)
    debugLog('可用插件列表', pluginNames)
    
    // 尝试各种可能的名称
    for (const name of ['AlipayPlugin', 'alipayPlugin', 'Alipay', 'alipay']) {
      if (cap.Plugins[name]) {
        debugLog(`✅ 找到插件: Plugins.${name}`)
        return cap.Plugins[name]
      }
    }
  }

  // 方式2: 尝试使用 registerPlugin
  if (typeof cap.registerPlugin === 'function') {
    try {
      debugLog('尝试使用 registerPlugin 获取插件...')
      const plugin = cap.registerPlugin('AlipayPlugin')
      if (plugin && typeof plugin.pay === 'function') {
        debugLog('✅ registerPlugin 成功')
        return plugin
      }
    } catch (e) {
      debugLog('❌ registerPlugin 失败', e.message)
    }
  }

  // 方式3: 使用底层桥接
  debugLog('尝试使用底层桥接...')
  const bridge = createAlipayBridge()
  if (bridge) {
    debugLog('✅ 底层桥接创建成功')
    return bridge
  }

  debugLog('❌ 所有方式都找不到 AlipayPlugin')
  return null
}

/**
 * 检查是否在原生环境中
 */
const isNativePlatform = () => {
  const cap = getCapacitor()
  return cap ? cap.isNativePlatform() : false
}

/**
 * 支付宝支付
 */
export const alipayPay = async (orderStr) => {
  debugLog('开始支付', { orderStrLength: orderStr?.length })

  if (!isNativePlatform()) {
    debugLog('❌ 非原生环境')
    return { success: false, error: '请在App环境中使用支付宝支付' }
  }

  const AlipayPlugin = getAlipayPlugin()
  
  if (!AlipayPlugin) {
    return { success: false, error: '支付宝插件未加载' }
  }

  if (typeof AlipayPlugin.pay !== 'function') {
    debugLog('❌ pay方法不存在', { methods: Object.keys(AlipayPlugin) })
    return { success: false, error: '支付宝插件方法不存在' }
  }

  try {
    debugLog('正在调起支付宝...')
    const result = await AlipayPlugin.pay({ orderStr })
    debugLog('支付完成', result)
    
    return {
      success: result?.success || false,
      message: result?.message || '',
      resultCode: result?.resultCode || '',
      result: result?.result
    }
  } catch (error) {
    debugLog('❌ 支付异常', error.message || error)
    return { success: false, error: error?.message || '支付调用失败' }
  }
}

/**
 * 检查支付宝是否安装
 */
export const isAlipayInstalled = async () => {
  if (!isNativePlatform()) return false

  const AlipayPlugin = getAlipayPlugin()
  if (!AlipayPlugin || typeof AlipayPlugin.isAlipayInstalled !== 'function') {
    return false
  }

  try {
    const result = await AlipayPlugin.isAlipayInstalled()
    return result?.installed || false
  } catch (error) {
    return false
  }
}

/**
 * 支付宝授权
 */
export const alipayAuth = async (authInfo) => {
  if (!isNativePlatform()) {
    return { success: false, error: '请在App环境中使用' }
  }

  const AlipayPlugin = getAlipayPlugin()
  if (!AlipayPlugin || typeof AlipayPlugin.auth !== 'function') {
    return { success: false, error: '支付宝插件未加载' }
  }

  try {
    const result = await AlipayPlugin.auth({ authInfo })
    return result
  } catch (error) {
    return { success: false, error: error?.message || '授权失败' }
  }
}

export default {
  pay: alipayPay,
  isInstalled: isAlipayInstalled,
  auth: alipayAuth
}
