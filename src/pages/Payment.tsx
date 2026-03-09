import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import '../App.css'
import './Payment.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingApi, paymentApi, type BookingResponseData } from '../services/api'

type EquipmentSelection = {
    itemId: number
    itemName: string
    category: string
    pricePerDay: number | null
    priceLabel: string
}

function Payment() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const bookingIdFromQuery = searchParams.get('bookingId') || sessionStorage.getItem('bookingId')
    const [paymentMethod, setPaymentMethod] = useState('bank') // 'momo' or 'bank'
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
    const [equipmentSelection, setEquipmentSelection] = useState<EquipmentSelection | null>(null)
    const [booking, setBooking] = useState<BookingResponseData | null>(null)
    const [serverAmountToPay, setServerAmountToPay] = useState<number | null>(null)

    const pollingIntervalRef = useRef<number | null>(null)
    const pollingTimeoutRef = useRef<number | null>(null)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        const raw = sessionStorage.getItem('equipmentSelection')
        if (!raw) return
        try {
            setEquipmentSelection(JSON.parse(raw) as EquipmentSelection)
        } catch (error) {
            console.error('equipmentSelection parse failed:', error)
        }
    }, [])

    useEffect(() => {
        if (!bookingIdFromQuery) return

        bookingApi
            .getById(bookingIdFromQuery)
            .then((res) => {
                if (!res?.success) return
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

    // Pricing
    const subTotal = booking?.budget?.min ?? equipmentSelection?.pricePerDay ?? 2000000
    const total = subTotal
    const depositAmount = Math.round(total * 0.25)
    const amountToPay = serverAmountToPay ?? depositAmount
    const remainingAmount = Math.max(total - amountToPay, 0)
    const formatPrice = (price: number) => price.toLocaleString('vi-VN') + ' vnđ'
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
    const bookingDateLabel = booking
        ? `${booking.bookingDate.day}/${booking.bookingDate.month}/${booking.bookingDate.year}`
        : null

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
                    alert('Thanh toán cọc thành công! Lịch của bạn đã được xác nhận.')
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

    const handleOrderSubmit = async () => {
        if (!formData.fullName || !formData.email || !formData.phone) {
            alert('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.')
            return
        }

        setIsProcessing(true)
        setPaymentStatus(null)

        const paymentData = {
            bookingId: bookingIdFromQuery || undefined,
            customerInfo: formData,
            services: booking ? [] : [{ name: equipmentSelection?.itemName || 'Sản xuất reel instagram', price: total }],
            paymentMethod: paymentMethod as 'bank' | 'momo',
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
                    {/* LEFT COLUMN */}
                    <div className="payment-left">

                        {/* 1. User Info Card */}
                        <div className="payment-card section-user-info">
                            <div className="card-header-note">
                                {booking
                                    ? 'Chúng tôi đang giữ đơn đặt lịch này cho bạn trong vòng 10:30 phút'
                                    : 'Chúng tôi đang giữ đơn hàng thiết bị này cho bạn trong vòng 10:30 phút'}
                            </div>
                            <h2 className="card-title">Thông tin của bạn</h2>

                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="input-field"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
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

                        {/* 2. Support Staff Card */}
                        <div className="payment-card section-staff">
                            <h2 className="card-title">Thêm người hỗ trợ</h2>
                            <div className="staff-list">
                                <div className="staff-item">
                                    <div className="staff-avatar"></div>
                                    <div className="staff-info">
                                        <h4>Long Cao</h4>
                                        <p>Chuyên viên kĩ thuật máy quay</p>
                                        <span className="staff-price">10.000đ/ngày</span>
                                    </div>
                                </div>
                                <div className="staff-item">
                                    <div className="staff-avatar"></div>
                                    <div className="staff-info">
                                        <h4>Hồng Quang</h4>
                                        <p>Chuyên viên kĩ thuật ánh sáng/máy ảnh</p>
                                        <span className="staff-price">15.000đ/ngày</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Add-on Services Card */}
                        <div className="payment-card section-services">
                            <h2 className="card-title">Dịch vụ đi kèm</h2>
                            <div className="service-options">
                                <div className="service-option-box">
                                    <h4>Tư vấn/hỗ trợ kịch bản</h4>
                                    <p>Free</p>
                                </div>
                                <div className="service-option-box">
                                    <h4>Viết lại kịch bản</h4>
                                    <p>2.000.000 vnđ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="payment-right">

                        {/* 1. Order Summary Card */}
                        <div className="payment-card section-summary">
                            <div className="service-header">
                                <div className="service-thumb"></div>
                                <div className="service-details">
                                    <h3>Thông tin dịch vụ</h3>
                                    {booking ? (
                                        <>
                                            <p>{booking.projectType}</p>
                                            <p>Ngày quay dự kiến: {bookingDateLabel}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>{equipmentSelection?.itemName || 'Sản xuất reel instagram'}</p>
                                            <p>{equipmentSelection?.category || 'Dịch vụ mặc định'}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="payment-amount-hero" role="status" aria-live="polite">
                                <p className="payment-amount-hero-label">Số tiền cần thanh toán ngay</p>
                                <p className="payment-amount-hero-value">{formatPrice(amountToPay)}</p>
                                <p className="payment-amount-hero-note">
                                    {booking
                                        ? 'Thanh toán cọc 25% để xác nhận lịch quay.'
                                        : 'Thanh toán cọc 25% để xác nhận đơn dịch vụ.'}
                                </p>
                            </div>

                            <div className="price-details">
                                <div className="price-header-row">
                                    <h3>Giá chi tiết</h3>
                                    <button className="discount-btn">Mã giảm giá</button>
                                </div>

                                <div className="price-row">
                                    <span>{booking ? `Đặt lịch ${booking.projectType}` : (equipmentSelection?.itemName || 'Sản xuất reel instagram')}</span>
                                    <span>{booking ? formatPrice(total) : (equipmentSelection?.priceLabel || formatPrice(total))}</span>
                                </div>
                                <div className="price-row">
                                    <span>Hỗ trợ kịch bản</span>
                                    <span>0 vnđ</span>
                                </div>

                                <div className="divider"></div>

                                <div className="price-row total-calc">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(subTotal)}</span>
                                </div>
                            </div>

                            <div className="total-highlight">
                                <span>Tổng giá trị đơn</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                                <div className="summary-note">
                                <div className="note-row">
                                    <span>Phí cọc trước 25%</span>
                                    <span>{formatPrice(amountToPay)}</span>
                                </div>
                                <div className="note-row">
                                    <span>Còn lại sau khi cọc</span>
                                    <span>{formatPrice(remainingAmount)}</span>
                                </div>
                                <p className="note-text">
                                    Để xác nhận lịch quay, quý khách vui lòng thanh toán trước 25% chi phí dự kiến.
                                </p>
                            </div>
                        </div>

                        {/* 2. Payment Methods Card */}
                        <div className="payment-card section-payment-methods">
                            <div className="payment-amount-inline">
                                Thanh toán ngay: <strong>{formatPrice(amountToPay)}</strong>
                            </div>

                            <div
                                className={`payment-choice ${paymentMethod === 'momo' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('momo')}
                            >
                                <div className="radio-circle">{paymentMethod === 'momo' && <div className="radio-dot" />}</div>
                                <span>Thanh toán bằng Ví điện tử MoMo</span>
                            </div>

                            <div
                                className={`payment-choice ${paymentMethod === 'bank' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('bank')}
                            >
                                <div className="radio-circle">{paymentMethod === 'bank' && <div className="radio-dot" />}</div>
                                <span>Thanh toán bằng chuyển khoản ngân hàng(quét mã QR)</span>
                            </div>

                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={isEmailChecked}
                                    onChange={(e) => setIsEmailChecked(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                <span className="checkbox-text">Gửi thông tin xác nhận đặt lịch qua email cá nhân.</span>
                            </label>

                            {paymentId && (
                                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                                    Mã thanh toán: {paymentId} {paymentStatus ? `- ${getPaymentStatusLabel(paymentStatus)}` : ''}
                                </p>
                            )}

                            {qrCodeUrl && (
                                <div className="qr-code-section" style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <h3>Quét mã QR để thanh toán</h3>
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code thanh toán"
                                        style={{ width: '250px', height: '250px', objectFit: 'contain' }}
                                    />
                                    <p className="qr-amount-text">Số tiền cần chuyển: {formatPrice(amountToPay)}</p>
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
