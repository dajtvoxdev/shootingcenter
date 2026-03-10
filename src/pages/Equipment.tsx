import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { contentApi, type EquipmentCategory, type EquipmentItem } from '../services/api'

type EquipmentCartItem = {
  itemId: number
  itemName: string
  category: string
  pricePerDay: number | null
  priceLabel: string
  imagePath: string
  quantity: number
}

const EQUIPMENT_CART_KEY = 'equipmentCart'

function getInitialEquipmentCart(): EquipmentCartItem[] {
  const raw = sessionStorage.getItem(EQUIPMENT_CART_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as EquipmentCartItem[]
  } catch (error) {
    console.error('equipmentCart parse failed:', error)
    return []
  }
}

function Equipment() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [cartItems, setCartItems] = useState<EquipmentCartItem[]>(getInitialEquipmentCart)

  useEffect(() => {
    contentApi
      .getEquipmentCatalog()
      .then((res) => {
        const cates = res.data?.categories || []
        setCategories(cates)
        setEquipmentItems(res.data?.items || [])
        setSelectedCategory(cates[0]?.name || '')
      })
      .catch((error) => {
        console.error('Load equipment catalog error:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    sessionStorage.setItem(EQUIPMENT_CART_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const filteredItems = useMemo(
    () => equipmentItems.filter((item) => item.category === selectedCategory),
    [equipmentItems, selectedCategory]
  )

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item: EquipmentItem) => {
    setCartItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.itemId === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.itemId === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }

      return [
        ...prev,
        {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          pricePerDay: item.pricePerDay,
          priceLabel: item.priceLabel,
          imagePath: item.imagePath,
          quantity: 1
        }
      ]
    })
  }

  const goToEquipmentCheckout = () => {
    if (cartCount === 0) {
      return
    }

    sessionStorage.removeItem('equipmentSelection')
    navigate('/payment?source=equipment-cart')
  }

  return (
    <>
      <div className="homepage">
        <Navigation />

        <section className="equipment-page">
          <div className="equipment-content">
            <div className="equipment-topbar">
              <div className="equipment-categories">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className={`equipment-category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="equipment-category-icon"
                      style={{
                        width: `${category.iconSize?.width ?? 70}px`,
                        height: `${category.iconSize?.height ?? 70}px`
                      }}
                    />
                    <span className="equipment-category-text">{category.name}</span>
                  </button>
                ))}
              </div>

              <button className="equipment-cart-btn" onClick={goToEquipmentCheckout} disabled={cartCount === 0}>
                <img src="/assets/images/equipment-cart-icon.svg" alt="Giỏ hàng" className="equipment-cart-icon" />
                <span className="equipment-cart-count">{cartCount}</span>
              </button>
            </div>

            <button
              className="equipment-booking-btn"
              onClick={() => window.open('https://www.facebook.com/profile.php?id=61582723575961', '_blank', 'noopener,noreferrer')}
            >
              Đặt lịch
            </button>

            <div className="equipment-grid">
              {loading && <p>Đang tải danh sách thiết bị...</p>}
              {filteredItems.map((item) => {
                const selectedQuantity = cartItems.find((cartItem) => cartItem.itemId === item.id)?.quantity ?? 0
                return (
                  <div key={item.id} className="equipment-card">
                    <div className="equipment-image-container">
                      <img src={item.imagePath} alt={item.name} className="equipment-image" />
                    </div>
                    <div className="equipment-info">
                      <h3 className="equipment-name">{item.name}</h3>
                      <p className="equipment-accessories">{item.accessories}</p>
                      <div className="equipment-card-footer">
                        <p className="equipment-price">{item.priceLabel}</p>
                        <button className="equipment-add-btn" onClick={() => addToCart(item)} aria-label={`Thêm ${item.name} vào giỏ`}>
                          <span>+</span>
                        </button>
                      </div>
                      {selectedQuantity > 0 && <p className="equipment-selected-note">Đã thêm {selectedQuantity} vào giỏ</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="equipment-footer-note">
              *Để cập nhật danh sách thiết bị có sẵn, quý khách vui lòng liên hệ qua fanpage
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}

export default Equipment
