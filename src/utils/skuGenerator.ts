interface SKUConfig {
  categoryPrefix: string;  // رمز الفئة (مثل: FUR)
  subType?: string;       // نوع فرعي (مثل: CH)
  attributes?: string[];  // صفات إضافية (مثل: BL)
}

export const generateSKU = async (supabase: any, config: SKUConfig) => {
  try {
    // جلب آخر رقم تسلسلي للفئة
    const { data: lastProduct } = await supabase
      .from('products')
      .select('sku')
      .ilike('sku', `${config.categoryPrefix}%`)
      .order('sku', { ascending: false })
      .limit(1)

    let sequence = 1
    if (lastProduct && lastProduct.length > 0) {
      // استخراج الرقم من آخر SKU
      const lastSequence = parseInt(lastProduct[0].sku.slice(-3))
      sequence = lastSequence + 1
    }

    // تجميع SKU
    let sku = config.categoryPrefix
    if (config.subType) {
      sku += `-${config.subType}`
    }
    if (config.attributes && config.attributes.length > 0) {
      sku += `-${config.attributes.join('-')}`
    }
    sku += `-${sequence.toString().padStart(3, '0')}`

    return sku
  } catch (error) {
    console.error('Error generating SKU:', error)
    throw error
  }
} 