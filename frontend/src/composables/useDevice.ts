import { ref, onMounted, onUnmounted } from 'vue'

export function useDevice() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)
  const deviceType = ref<'mobile' | 'tablet' | 'desktop'>('desktop')

  const checkDevice = () => {
    const width = window.innerWidth
    const userAgent = navigator.userAgent.toLowerCase()
    
    // Check by user agent
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    // Check by screen width
    if (width < 768) {
      isMobile.value = true
      isTablet.value = false
      isDesktop.value = false
      deviceType.value = 'mobile'
    } else if (width >= 768 && width < 1024) {
      isMobile.value = false
      isTablet.value = true
      isDesktop.value = false
      deviceType.value = 'tablet'
    } else {
      isMobile.value = false
      isTablet.value = false
      isDesktop.value = true
      deviceType.value = 'desktop'
    }
    
    // Override with user agent if detected as mobile device
    if (isMobileUA && width < 1024) {
      isMobile.value = true
      isDesktop.value = false
      deviceType.value = 'mobile'
    }
    
    // Update body class
    document.body.classList.remove('mobile-view', 'tablet-view', 'desktop-view')
    document.body.classList.add(`${deviceType.value}-view`)
    
    // Update html class for better targeting
    document.documentElement.classList.remove('mobile-view', 'tablet-view', 'desktop-view')
    document.documentElement.classList.add(`${deviceType.value}-view`)
  }

  onMounted(() => {
    checkDevice()
    window.addEventListener('resize', checkDevice)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkDevice)
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
  }
}
