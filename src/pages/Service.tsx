import { type ChangeEvent, useEffect, useState } from 'react'
import '../App.css'
import './Service.css' // Import new styles
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { bookingApi, contentApi } from '../services/api'
import { useNavigate } from 'react-router-dom'

type ProjectType = 'TVC Quảng cáo' | 'Sản xuất video/MV' | 'Phóng sự cưới' | 'Quay trả file'
type DurationType = 'Cả ngày(8-10 tiếng)' | 'Nửa ngày(4-5 tiếng)'

function Service() {
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedSubService, setSelectedSubService] = useState<string | null>(null)
  const [minBudget, setMinBudget] = useState<number>(1000000) // 1 triệu
  const [maxBudget, setMaxBudget] = useState<number>(100000000) // 100 triệu
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [selectedNextStep, setSelectedNextStep] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [showPhoneForm, setShowPhoneForm] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [bookedDates, setBookedDates] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // New states for the master-detail selection
  const [selectedProject, setSelectedProject] = useState<ProjectType>('Quay trả file')
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('Cả ngày(8-10 tiếng)')

  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [conceptOptions, setConceptOptions] = useState<string[]>(['Chưa có', 'Đã có', 'Đang hoàn thiện, cần hỗ trợ'])
  const [weekDays, setWeekDays] = useState<string[]>(['Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'CN'])
  const [monthNames, setMonthNames] = useState<string[]>(['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'])

  useEffect(() => {
    bookingApi
      .getBookedDates(currentYear, currentMonth)
      .then((res) => {
        if (res.success) {
          setBookedDates(res.data.bookedDates || [])
        }
      })
      .catch((error) => {
        console.error('Failed to load booked dates:', error)
        setBookedDates([])
      })
  }, [currentMonth, currentYear])

  useEffect(() => {
    contentApi
      .getServiceConfig()
      .then((res) => {
        if (!res?.success) return

        const images = Array.isArray(res.data?.galleryImages) ? res.data.galleryImages : []
        if (images.length > 0) {
          setGalleryImages(images)
          setSelectedImage(images[0])
        }

        if (Array.isArray(res.data?.conceptOptions) && res.data.conceptOptions.length > 0) {
          setConceptOptions(res.data.conceptOptions)
        }

        if (Array.isArray(res.data?.weekDays) && res.data.weekDays.length === 7) {
          setWeekDays(res.data.weekDays)
        }

        if (Array.isArray(res.data?.monthNames) && res.data.monthNames.length === 12) {
          setMonthNames(res.data.monthNames)
        }
      })
      .catch((error) => {
        console.error('Failed to load service config:', error)
      })
  }, [])

  const projectOptions: ProjectType[] = [
    'TVC Quảng cáo',
    'Sản xuất video/MV',
    'Phóng sự cưới',
    'Quay trả file'
  ]

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN').replace(/,/g, '.')
  }

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value <= maxBudget) {
      setMinBudget(value)
    } else {
      setMinBudget(maxBudget)
    }
  }

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value >= minBudget) {
      setMaxBudget(value)
    } else {
      setMaxBudget(minBudget)
    }
  }

  const getMinPercentage = () => {
    return ((minBudget - 1000000) / (100000000 - 1000000)) * 100
  }

  const getMaxPercentage = () => {
    return ((maxBudget - 1000000) / (100000000 - 1000000)) * 100
  }

  const isPastDate = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day)
    selected.setHours(0, 0, 0, 0)

    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return selected < tomorrow
  }

  const handleCardClick = (serviceId: string) => {
    setSelectedService(serviceId)
    setSelectedSubService(null)
  }

  const handleMainServiceConfirm = () => {
    if (selectedProject === 'Quay trả file') {
      setSelectedSubService(`${selectedProject} - ${selectedDuration}`)
    } else {
      setSelectedSubService(selectedProject)
    }
  }

  const handleBackClick = () => {
    if (showPhoneForm) {
      setShowPhoneForm(false)
    } else if (selectedNextStep !== null) {
      setSelectedNextStep(null)
    } else if (selectedConcept !== null) {
      setSelectedConcept(null)
    } else if (selectedSubService) {
      setSelectedSubService(null)
    } else {
      setSelectedService(null)
    }
  }

  const handleSubmitPhone = async () => {
    if (!selectedService || !selectedConcept || !selectedDate || !phoneNumber.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin trước khi gửi.')
      return
    }

    setIsSubmitting(true)

    const bookingData = {
      service: selectedService,
      projectType: selectedProject,
      duration: ['Quay trả file', 'Phóng sự cưới'].includes(selectedProject) ? selectedDuration : null,
      budget: { min: minBudget, max: maxBudget },
      conceptStatus: selectedConcept,
      bookingDate: {
        day: selectedDate,
        month: currentMonth,
        year: currentYear
      },
      phoneNumber
    }

    try {
      const result = await bookingApi.create(bookingData)
      if (result.success) {
        sessionStorage.setItem('bookingId', result.data.bookingId)
        navigate(`/payment?bookingId=${encodeURIComponent(result.data.bookingId)}`)
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    setShowPhoneForm(false)
    setSelectedNextStep(null)
    setSelectedConcept(null)
    setSelectedSubService(null)
    setSelectedService(null)
  }

  const handleSelectClick = () => {
    setSelectedConcept('')
  }

  const handleConceptClick = (concept: string) => {
    setSelectedConcept(concept)
    setSelectedNextStep('calendar')
  }

  const handleDateClick = (date: number) => {
    if (!bookedDates.includes(date) && !isPastDate(date)) {
      setSelectedDate(date)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days = []

    // Thêm các ngày trống ở đầu
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Thêm các ngày trong tháng
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  return (
    <>
      <div className="homepage">
        <Navigation />

        {/* Service Page Content */}
        <section className="service-page">
          <div className="service-content">
            <h1 className="service-title">Choose your<br />best idea!</h1>
            <p className="service-subtitle">Let's we shape your story ✨</p>

            <div className="service-container">
              {showPhoneForm ? (
                <>
                  <button className="service-back-button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">
                    Vui lòng nhập số điện thoại của bạn!
                  </h3>

                  <div className="phone-input-container">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="phone-input"
                    />
                  </div>

                  <button className="service-submit-button" onClick={handleSubmitPhone} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </>
              ) : selectedNextStep !== null ? (
                <>
                  <button className="service-back-button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">
                    Khi nào dự án của bạn bắt đầu?
                  </h3>

                  <div className="calendar-container">
                    <div className="calendar-month-nav">
                      <button className="calendar-month-nav-button" onClick={handlePrevMonth}>
                        &lt;
                      </button>
                      <strong className="calendar-month-label">{monthNames[currentMonth]} {currentYear}</strong>
                      <button className="calendar-month-nav-button" onClick={handleNextMonth}>
                        &gt;
                      </button>
                    </div>

                    <div className="calendar-header">
                      {weekDays.map((day, index) => (
                        <div key={index} className="calendar-weekday">{day}</div>
                      ))}
                    </div>
                    <div className="calendar-grid">
                      {getDaysInMonth().map((day, index) => {
                        if (day === null) {
                          return <div key={index} className="calendar-day empty"></div>
                        }
                        const isBooked = bookedDates.includes(day)
                        const isDisabledPast = isPastDate(day)
                        const isSelected = selectedDate === day
                        return (
                          <div
                            key={index}
                            className={`calendar-day ${isBooked ? 'booked' : ''} ${isDisabledPast ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleDateClick(day)}
                          >
                            {day}
                            {isSelected && <div className="calendar-selected-circle"></div>}
                          </div>
                        )
                      })}
                    </div>
                    <p className="calendar-note">
                      Chỉ đặt được từ ngày mai trở đi. Ngày đỏ là đã có khách book, ngày xám là không khả dụng.
                    </p>
                  </div>

                  <button
                    className="service-select-button"
                    onClick={() => {
                      if (selectedDate) {
                        setShowPhoneForm(true)
                      }
                    }}
                  >
                    Chọn
                  </button>
                </>
              ) : selectedConcept !== null ? (
                <>
                  <button className="service-back-button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">
                    Bạn đã có concept/kịch bản chưa?
                  </h3>

                  <div className="service-cards">
                    {conceptOptions.map((option, index) => (
                      <div
                        key={index}
                        className="service-card"
                        onClick={() => handleConceptClick(option)}
                      >
                        <h3 className="service-card-title" style={{ color: '#747474' }}>
                          {option}
                        </h3>
                      </div>
                    ))}
                  </div>
                </>
              ) : selectedSubService ? (
                <>
                  <button className="service-back-button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">
                    Ngân sách của bạn là bao nhiêu?
                  </h3>

                  <div className="budget-slider-container">
                    <div className="budget-slider-wrapper">
                      <div className="budget-range-track">
                        <div
                          className="budget-range-fill"
                          style={{
                            left: `${getMinPercentage()}%`,
                            width: `${getMaxPercentage() - getMinPercentage()}%`
                          }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        min="1000000"
                        max="100000000"
                        step="1000000"
                        value={minBudget}
                        onChange={handleMinChange}
                        className="budget-slider budget-slider-min"
                      />
                      <input
                        type="range"
                        min="1000000"
                        max="100000000"
                        step="1000000"
                        value={maxBudget}
                        onChange={handleMaxChange}
                        className="budget-slider budget-slider-max"
                      />
                      <div
                        className="budget-thumb-label budget-thumb-label-min"
                        style={{ left: `${getMinPercentage()}%` }}
                      >
                        <div className="budget-thumb-box">
                          {formatCurrency(minBudget)} đ
                        </div>
                      </div>
                      <div
                        className="budget-thumb-label budget-thumb-label-max"
                        style={{ left: `${getMaxPercentage()}%` }}
                      >
                        <div className="budget-thumb-box">
                          {formatCurrency(maxBudget)} đ
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="budget-note">
                    *Lưu ý: Chi phí có thể thay đổi và phát sinh tuỳ theo yêu cầu cụ thể của từng dự án
                  </p>

                  <button className="service-select-button" onClick={handleSelectClick}>
                    Chọn
                  </button>
                </>
              ) : selectedService ? (
                <>
                  <button className="service-back-button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  {/* NEW MASTER-DETAIL LAYOUT */}
                  <div className="service-layout-container">
                    {/* Left Sidebar */}
                    <div className="service-sidebar-card">
                      <h2 className="service-sidebar-title">Lựa chọn nhu cầu của bạn.</h2>
                      {projectOptions.map(option => (
                        <div
                          key={option}
                          className={`service-option-btn ${selectedProject === option ? 'active' : ''}`}
                          onClick={() => setSelectedProject(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>

                    {/* Right Content */}
                    <div className="service-detail-area">
                      {/* Image Gallery */}
                      <div className="detail-gallery">
                        <img
                          src={selectedImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHN2ZyB4PSI1MCUiIHk9IjUwJSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM5OTkiPjxwYXRoIGQ9Ik0yMSAxOWw2LTZ2MTRoLTR6bS0xMiAwaDZ2LTRoLTZ6bS02IDBoNHYtNmgtNHptMTgtOGgtNnY2aDZ6bS0xMiAwaDZ2LTZoLTZ6bS02IDBoNHYtNGgtNHoiLz48L3N2Zz48L3N2Zz4='}
                          alt="Main view"
                          className="gallery-main-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHN2ZyB4PSI1MCUiIHk9IjUwJSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM5OTkiPjxwYXRoIGQ9Ik0yMSAxOWw2LTZ2MTRoLTR6bS0xMiAwaDZ2LTRoLTZ6bS02IDBoNHYtNmgtNHptMTgtOGgtNnY2aDZ6bS0xMiAwaDZ2LTZoLTZ6bS02IDBoNHYtNGgtNHoiLz48L3N2Zz48L3N2Zz4='
                          }}
                        />
                        <div className="gallery-thumbnails">
                          {galleryImages.length > 0 ? galleryImages.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className={`gallery-thumb ${selectedImage === img ? 'active' : ''}`}
                              onClick={() => setSelectedImage(img)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlMGUwIi8+PC9zdmc+'
                              }}
                            />
                          )) : (
                            <div className="gallery-thumb-placeholder" style={{ 
                              width: '80px', 
                              height: '60px', 
                              background: '#e0e0e0',
                              borderRadius: '4px'
                            }}></div>
                          )}
                        </div>
                      </div>

                      {/* Detail Description: Only for 'Quay trả file' */}
                      {selectedProject === 'Quay trả file' && (
                        <div className="detail-description">
                          Dịch vụ bao gồm quay hình theo yêu cầu và bàn giao file gốc.<br />
                          Không bao gồm dịch vụ biên tập video. Quý khách vui lòng lưu ý.
                        </div>
                      )}

                      {/* Duration Section: For 'Quay trả file' AND 'Phóng sự cưới' */}
                      {(selectedProject === 'Quay trả file' || selectedProject === 'Phóng sự cưới') && (
                        <div className="duration-section">
                          <div className="duration-title">Thời lượng quay</div>
                          <div className="duration-options">
                            <button
                              className={`duration-btn ${selectedDuration === 'Cả ngày(8-10 tiếng)' ? 'active' : ''}`}
                              onClick={() => setSelectedDuration('Cả ngày(8-10 tiếng)')}
                            >
                              Cả ngày(8-10 tiếng)
                            </button>
                            <button
                              className={`duration-btn ${selectedDuration === 'Nửa ngày(4-5 tiếng)' ? 'active' : ''}`}
                              onClick={() => setSelectedDuration('Nửa ngày(4-5 tiếng)')}
                            >
                              Nửa ngày(4-5 tiếng)
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="action-btn-container">
                    <button className="select-service-action-btn" onClick={handleMainServiceConfirm}>
                      {['Quay trả file', 'Phóng sự cưới'].includes(selectedProject)
                        ? `${selectedProject} - ${selectedDuration.split('(')[0]}`
                        : selectedProject}
                    </button>
                  </div>

                  <p className="service-footer-text" style={{ textAlign: 'center', marginTop: '30px' }}>
                    Có áp dụng giới hạn về số lượng. Truy cập Chính sách của chúng tôi để xem điều khoản và điều kiện đầy đủ.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>

                  <div className="service-cards">
                    <div className="service-card" onClick={() => handleCardClick('outdoor-studio')}>
                      <h3 className="service-card-title outdoor-studio">Outdoor Studio</h3>
                      <p className="service-card-text">Biến mọi nơi thành studio</p>
                    </div>

                    <div className="service-card" onClick={() => handleCardClick('production-house')}>
                      <h3 className="service-card-title production-house">Production House</h3>
                      <p className="service-card-text">Cùng bạn thực hiện ý tưởng</p>
                    </div>

                    <div className="service-card" onClick={() => handleCardClick('rental-house')}>
                      <h3 className="service-card-title rental-house">Rental House</h3>
                      <p className="service-card-text">Hỗ trợ bạn về mặt thiết bị*</p>
                    </div>
                  </div>

                  <p className="service-footer-text">
                    Có áp dụng giới hạn về số lượng. Truy cập Chính sách của chúng tôi để xem điều khoản và điều kiện đầy đủ.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleCloseModal}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <p className="success-modal-text">
              Yêu cầu của bạn đã được gửi đi!<br />
              Cảm ơn bạn đã chọn tin tưởng chúng tôi
            </p>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default Service
