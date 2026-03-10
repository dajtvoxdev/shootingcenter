import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../App.css'
import './Payment.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { bookingApi, paymentApi, type BookingResponseData } from '../services/api'

type EquipmentSelection = {
  itemId: number
  itemName: string
  category: string
  pricePerDay: number | null
  priceLabel: string
  imagePath?: string
}

type EquipmentCartItem = EquipmentSelection & {
  quantity: number
}

type SelectableItem = {
  id: string
  name: string
  price: number
  description?: string
  image?: string
}

const SUPPORT_STAFF_OPTIONS: SelectableItem[] = [
  {
    id: 'support-long-cao',
    name: 'Long Cao',
    description: 'Chuyên viên kĩ thuật máy quay.',
    price: 900000,
    image: '/assets/images/payment-support-long-cao.png'
  },
  {
    id: 'support-hong-quang',
    name: 'Hồng Quang',
    description: 'Chuyên viên kĩ thuật ánh sáng.',
    price: 500000,
    image: '/assets/images/payment-support-hong-quang.png'
  }
]

const SERVICE_ADD_ON_OPTIONS: SelectableItem[] = [
  {
    id: 'script-support',
    name: 'Tư vấn/hỗ trợ kịch bản',
    price: 0
  },
  {
    id: 'script-rewrite',
    name: 'Viết lại kịch bản',
    price: 2000000
  }
]

const EQUIPMENT_CART_KEY = 'equipmentCart'

function formatPriceValue(price: number) {
  return `${price.toLocaleString('vi-VN')} vnđ`
}

function getInitialEquipmentSelection(): EquipmentSelection | null {
  const raw = sessionStorage.getItem('equipmentSelection')
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as EquipmentSelection
  } catch (error) {
    console.error('equipmentSelection parse failed:', error)
    return null
  }
}

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

function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentSource = searchParams.get('source')
  const bookingIdFromQuery =
    paymentSource === 'equipment-cart'
      ? null
      : searchParams.get('bookingId') || sessionStorage.getItem('bookingId')
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'momo'>('bank')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    additionalInfo: ''
  })
  const [isEmailChecked, setIsEmailChecked] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [equipmentSelection] = useState<EquipmentSelection | null>(getInitialEquipmentSelection)
  const [equipmentCart, setEquipmentCart] = useState<EquipmentCartItem[]>(getInitialEquipmentCart)
  const [booking, setBooking] = useState<BookingResponseData | null>(null)
  const [serverAmountToPay, setServerAmountToPay] = useState<number | null>(null)
  const [selectedSupportStaff, setSelectedSupportStaff] = useState<string[]>([])
  const [selectedServiceAddOns, setSelectedServiceAddOns] = useState<string[]>([])

  const pollingIntervalRef = useRef<number | null>(null)
  const pollingTimeoutRef = useRef<number | null>(null)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    sessionStorage.setItem(EQUIPMENT_CART_KEY, JSON.stringify(equipmentCart))
  }, [equipmentCart])

  useEffect(() => {
    if (!bookingIdFromQuery) {
      return
    }

    bookingApi
      .getById(bookingIdFromQuery)
      .then((res) => {
        if (!res?.success) {
          return
        }

        setBooking(res.data)
        setFormData((prev) => ({
          ...prev,
          phone: prev.phone || res.data.phoneNumber || ''
        }))
      })
      .catch((error) => {
        console.error('Load booking detail failed:', error)
      })
  }, [bookingIdFromQuery])

  const equipmentCartItems = equipmentCart.filter((item) => item.quantity > 0)
  const isEquipmentCheckout = !booking && equipmentCartItems.length > 0
  const selectedSupportItems = SUPPORT_STAFF_OPTIONS.filter((item) => selectedSupportStaff.includes(item.id))
  const selectedAddOnItems = SERVICE_ADD_ON_OPTIONS.filter((item) => selectedServiceAddOns.includes(item.id))

  const baseItem = booking
    ? {
        name: `Đặt lịch ${booking.projectType}`,
        price: booking.budget?.min ?? 0
      }
    : {
        name: equipmentSelection?.itemName || 'Thiết bị',
        price: equipmentSelection?.pricePerDay ?? 0
      }

  const pricingItems = booking
    ? [
        { name: baseItem.name, price: baseItem.price },
        ...selectedSupportItems.map((item) => ({ name: `${item.name} - Thuê thêm người`, price: item.price })),
        ...selectedAddOnItems.map((item) => ({ name: item.name, price: item.price }))
      ]
    : isEquipmentCheckout
      ? equipmentCartItems.map((item) => ({
          name: `${item.itemName} x${item.quantity}`,
          price: (item.pricePerDay ?? 0) * item.quantity
        }))
      : equipmentSelection
        ? [{ name: equipmentSelection.itemName, price: equipmentSelection.pricePerDay ?? 0 }]
        : []

  const subTotal = pricingItems.reduce((sum, item) => sum + item.price, 0)
  const total = subTotal
  const depositAmount = Math.round(total * 0.25)
  const amountToPay = serverAmountToPay ?? depositAmount
  const remainingAmount = Math.max(total - amountToPay, 0)
  const bookingDateLabel = booking
    ? `${booking.bookingDate.day}/${booking.bookingDate.month}/${booking.bookingDate.year}`
    : null
  const equipmentPreviewImage = equipmentCartItems[0]?.imagePath || equipmentSelection?.imagePath || null

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    if (pollingTimeoutRef.current) {
      window.clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
  }

  const startPolling = (id: string) => {
    clearPolling()

    pollingIntervalRef.current = window.setInterval(async () => {
      try {
        const status = await paymentApi.checkStatus(id)
        setPaymentStatus(status?.data?.status ?? null)

        if (status?.data?.status === 'paid') {
          clearPolling()
          alert(booking ? 'Thanh toán cọc thành công! Lịch của bạn đã được xác nhận.' : 'Thanh toán cọc thành công! Đơn thuê thiết bị của bạn đã được xác nhận.')
          navigate('/')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000)

    pollingTimeoutRef.current = window.setTimeout(() => {
      clearPolling()
    }, 15 * 60 * 1000)
  }

  const toggleSupportStaff = (id: string) => {
    setSelectedSupportStaff((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleServiceAddOn = (id: string) => {
    setSelectedServiceAddOns((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const updateEquipmentQuantity = (itemId: number, change: number) => {
    setEquipmentCart((prev) =>
      prev
        .map((item) => (item.itemId === itemId ? { ...item, quantity: Math.max(item.quantity + change, 0) } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const getPaymentStatusLabel = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán'
      case 'paid':
        return 'Đã thanh toán'
      case 'expired':
        return 'Hết hạn thanh toán'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const handleOrderSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.')
      return
    }

    if (pricingItems.length === 0 || total <= 0) {
      alert('Chưa có hạng mục thanh toán hợp lệ.')
      return
    }

    setIsProcessing(true)
    setPaymentStatus(null)

    const paymentData = {
      bookingId: bookingIdFromQuery || undefined,
      customerInfo: formData,
      services: pricingItems,
      paymentMethod,
      paymentType: 'deposit' as const,
      sendEmailConfirmation: isEmailChecked
    }

    try {
      const result = await paymentApi.create(paymentData)
      if (result.success) {
        setPaymentId(result.data.paymentId)
        setQrCodeUrl(result.data.qrCodeUrl)
        setPaymentStatus(result.data.status)
        setServerAmountToPay(result.data.amount)
        startPolling(result.data.paymentId)
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    return () => {
      clearPolling()
    }
  }, [])

  return (
    <>
      <div className="homepage">
        <Navigation />

        <section className="payment-page">
          <div className="payment-grid">
            <div className="payment-left">
              {isEquipmentCheckout && (
                <div className="payment-card section-equipment-cart">
                  <h2 className="card-title">Danh sách thiết bị đã chọn</h2>
                  <div className="equipment-selection-list">
                    {equipmentCartItems.map((item) => (
                      <div key={item.itemId} className="equipment-selection-item">
                        <img src={item.imagePath} alt={item.itemName} className="equipment-selection-image" />
                        <div className="equipment-selection-info">
                          <h4>{item.itemName}</h4>
                          <p>{item.category}</p>
                          <span>{item.priceLabel}</span>
                        </div>
                        <div className="equipment-quantity-control">
                          <button type="button" onClick={() => updateEquipmentQuantity(item.itemId, -1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateEquipmentQuantity(item.itemId, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="payment-card section-user-info">
                <div className="card-header-note">
                  {booking
                    ? 'Chúng tôi đang giữ đơn đặt lịch này cho bạn trong vòng 10:30 phút'
                    : 'Chúng tôi đang giữ đơn thuê thiết bị này cho bạn trong vòng 10:30 phút'}
                </div>
                <h2 className="card-title">Thông tin của bạn</h2>

                <div className="form-group">
                  <label>Họ và tên</label>
                  <input type="text" name="fullName" className="input-field" value={formData.fullName} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" className="input-field" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Thông tin bổ sung</label>
                  <input
                    type="text"
                    name="additionalInfo"
                    className="input-field"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {booking && (
                <>
                  <div className="payment-card section-staff">
                    <h2 className="card-title">Thêm người hỗ trợ</h2>
                    <div className="staff-list">
                      {SUPPORT_STAFF_OPTIONS.map((staff) => {
                        const isActive = selectedSupportStaff.includes(staff.id)
                        return (
                          <button
                            key={staff.id}
                            type="button"
                            className={`staff-card ${isActive ? 'active' : ''}`}
                            onClick={() => toggleSupportStaff(staff.id)}
                          >
                            <img src={staff.image} alt={staff.name} className="staff-avatar" />
                            <div className="staff-info">
                              <h4>{staff.name}</h4>
                              <p>{staff.description}</p>
                              <span className="staff-price">{formatPriceValue(staff.price)}/ngày</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="payment-card section-services">
                    <h2 className="card-title">Dịch vụ đi kèm</h2>
                    <div className="service-options">
                      {SERVICE_ADD_ON_OPTIONS.map((item) => {
                        const isActive = selectedServiceAddOns.includes(item.id)
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`service-option-box ${isActive ? 'active' : ''}`}
                            onClick={() => toggleServiceAddOn(item.id)}
                          >
                            <h4>{item.name}</h4>
                            <p>{item.price === 0 ? 'Free' : formatPriceValue(item.price)}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="payment-right">
              <div className="payment-card section-summary">
                <div className="service-header">
                  <div className="service-thumb">
                    {equipmentPreviewImage && !booking && (
                      <img src={equipmentPreviewImage} alt="Thiết bị đã chọn" className="service-thumb-image" />
                    )}
                  </div>
                  <div className="service-details">
                    <h3>Thông tin dịch vụ</h3>
                    {booking ? (
                      <>
                        <p>{booking.projectType}</p>
                        <p>Ngày quay dự kiến: {bookingDateLabel}</p>
                        {booking.duration && <p>Thời lượng: {booking.duration}</p>}
                      </>
                    ) : (
                      <>
                        <p>{isEquipmentCheckout ? `${equipmentCartItems.length} thiết bị trong giỏ` : equipmentSelection?.itemName || 'Thiết bị'}</p>
                        <p>{isEquipmentCheckout ? 'Thanh toán cọc 25% để xác nhận đơn thuê thiết bị.' : equipmentSelection?.category || 'Thiết bị'}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="payment-amount-hero" role="status" aria-live="polite">
                  <p className="payment-amount-hero-label">Số tiền cần thanh toán ngay</p>
                  <p className="payment-amount-hero-value">{formatPriceValue(amountToPay)}</p>
                  <p className="payment-amount-hero-note">
                    {booking
                      ? 'Thanh toán cọc 25% để xác nhận lịch quay.'
                      : 'Thanh toán cọc 25% để xác nhận đơn thuê thiết bị.'}
                  </p>
                </div>

                <div className="price-details">
                  <div className="price-header-row">
                    <h3>Giá chi tiết</h3>
                    <button className="discount-btn">Mã giảm giá</button>
                  </div>

                  {pricingItems.map((item) => (
                    <div key={item.name} className="price-row">
                      <span>{item.name}</span>
                      <span>{formatPriceValue(item.price)}</span>
                    </div>
                  ))}

                  <div className="divider"></div>

                  <div className="price-row total-calc">
                    <span>Tạm tính</span>
                    <span>{formatPriceValue(subTotal)}</span>
                  </div>
                </div>

                <div className="total-highlight">
                  <span>Tổng giá trị đơn</span>
                  <span>{formatPriceValue(total)}</span>
                </div>

                <div className="summary-note">
                  <div className="note-row">
                    <span>Phí cọc trước 25%</span>
                    <span>{formatPriceValue(amountToPay)}</span>
                  </div>
                  <div className="note-row">
                    <span>Còn lại sau khi cọc</span>
                    <span>{formatPriceValue(remainingAmount)}</span>
                  </div>
                  <p className="note-text">
                    {booking
                      ? 'Để xác nhận lịch quay, quý khách vui lòng thanh toán trước 25% chi phí dự kiến.'
                      : 'Để xác nhận đơn thuê thiết bị, quý khách vui lòng thanh toán trước 25% tổng giá trị dự kiến.'}
                  </p>
                </div>
              </div>

              <div className="payment-card section-payment-methods">
                <div className="payment-amount-inline">
                  Thanh toán ngay: <strong>{formatPriceValue(amountToPay)}</strong>
                </div>

                <div className={`payment-choice ${paymentMethod === 'momo' ? 'active' : ''}`} onClick={() => setPaymentMethod('momo')}>
                  <div className="radio-circle">{paymentMethod === 'momo' && <div className="radio-dot" />}</div>
                  <span>Thanh toán bằng Ví điện tử MoMo</span>
                </div>

                <div className={`payment-choice ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('bank')}>
                  <div className="radio-circle">{paymentMethod === 'bank' && <div className="radio-dot" />}</div>
                  <span>Thanh toán bằng chuyển khoản ngân hàng(quét mã QR)</span>
                </div>

                <label className="checkbox-container">
                  <input type="checkbox" checked={isEmailChecked} onChange={(event) => setIsEmailChecked(event.target.checked)} />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">Gửi thông tin xác nhận qua email cá nhân.</span>
                </label>

                {paymentId && (
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    Mã thanh toán: {paymentId} {paymentStatus ? `- ${getPaymentStatusLabel(paymentStatus)}` : ''}
                  </p>
                )}

                {qrCodeUrl && (
                  <div className="qr-code-section" style={{ textAlign: 'center', marginTop: '20px' }}>
                    <h3>Quét mã QR để thanh toán</h3>
                    <img src={qrCodeUrl} alt="QR Code thanh toán" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
                    <p className="qr-amount-text">Số tiền cần chuyển: {formatPriceValue(amountToPay)}</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      Mở app ngân hàng và quét mã QR. Thông tin sẽ được tự động điền.
                    </p>
                  </div>
                )}

                <button className="confirm-order-btn" onClick={handleOrderSubmit} disabled={isProcessing}>
                  {isProcessing ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}

export default Payment
