import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { contentApi, type EquipmentCategory, type EquipmentItem } from '../services/api'

function Equipment() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

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

  const filteredItems = useMemo(
    () => equipmentItems.filter(item => item.category === selectedCategory),
    [equipmentItems, selectedCategory]
  )

  const handlePayEquipment = (item: EquipmentItem) => {
    sessionStorage.setItem('equipmentSelection', JSON.stringify({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      pricePerDay: item.pricePerDay,
      priceLabel: item.priceLabel
    }))
    navigate('/payment')
  }

  return (
    <>
      <div className="homepage">
        <Navigation />

        {/* Equipment Page Content */}
        <section className="equipment-page">
          <div className="equipment-content">
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

            <button
              className="equipment-booking-btn"
              onClick={() => window.open('https://www.facebook.com/profile.php?id=61582723575961', '_blank', 'noopener,noreferrer')}
            >
              Đặt lịch
            </button>

            <div className="equipment-grid">
              {loading && <p>Đang tải danh sách thiết bị...</p>}
              {filteredItems.map((item) => (
                <div key={item.id} className="equipment-card">
                  <div className="equipment-image-container">
                    <img src={item.imagePath} alt={item.name} className="equipment-image" />
                  </div>
                  <div className="equipment-info">
                    <h3 className="equipment-name">{item.name}</h3>
                    <p className="equipment-accessories">{item.accessories}</p>
                    <p className="equipment-price">{item.priceLabel}</p>
                  </div>
                </div>
              ))}
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
