import { type ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import './Service.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { bookingApi, contentApi } from '../services/api'

type DurationType = 'Cả ngày(8-10 tiếng)' | 'Nửa ngày(4-5 tiếng)'

type ServiceOption = {
  title: string
  images: [string, string, string, string]
  requiresDuration?: boolean
  description?: string
}

const defaultGalleryImages = [
  '/assets/images/hero-image-1.png',
  '/assets/images/hero-image-2.png',
  '/assets/images/hero-image-3.png',
  '/assets/images/hero-image-1.png'
] as const

const serviceOptionsByService: Record<string, ServiceOption[]> = {
  'outdoor-studio': [
    {
      title: 'TVC Quảng cáo',
      images: [
        '/assets/images/outdoor-tvc-main.png',
        '/assets/images/outdoor-tvc-thumb-1.png',
        '/assets/images/outdoor-tvc-thumb-2.png',
        '/assets/images/outdoor-tvc-thumb-3.png'
      ]
    },
    {
      title: 'Sản xuất video/MV',
      images: [
        '/assets/images/outdoor-video-mv-main.png',
        '/assets/images/outdoor-video-mv-thumb-1.png',
        '/assets/images/outdoor-video-mv-thumb-2.png',
        '/assets/images/outdoor-video-mv-thumb-3.png'
      ]
    },
    {
      title: 'Phóng sự cưới',
      images: [
        '/assets/images/outdoor-phong-su-cuoi-main.png',
        '/assets/images/outdoor-phong-su-cuoi-thumb-1.png',
        '/assets/images/outdoor-phong-su-cuoi-thumb-2.png',
        '/assets/images/outdoor-phong-su-cuoi-thumb-3.png'
      ],
      requiresDuration: true
    },
    {
      title: 'Quay trả file',
      images: [
        '/assets/images/outdoor-quay-tra-file-main.png',
        '/assets/images/outdoor-quay-tra-file-thumb-1.png',
        '/assets/images/outdoor-quay-tra-file-thumb-2.png',
        '/assets/images/outdoor-quay-tra-file-thumb-3.png'
      ],
      requiresDuration: true,
      description:
        'Dịch vụ bao gồm quay hình theo yêu cầu và bàn giao file gốc. Không bao gồm dịch vụ biên tập video. Quý khách vui lòng lưu ý.'
    }
  ],
  'production-house': [
    {
      title: 'Kỉ yếu',
      images: [
        '/assets/images/production-ky-yeu-main.png',
        '/assets/images/production-ky-yeu-thumb-1.png',
        '/assets/images/production-ky-yeu-thumb-2.png',
        '/assets/images/production-ky-yeu-thumb-3.png'
      ],
      description:
        'Dịch vụ bao gồm quay hình theo yêu cầu và bàn giao file gốc. Không bao gồm dịch vụ biên tập video. Quý khách vui lòng lưu ý.'
    },
    {
      title: 'Chụp ảnh cưới',
      images: [
        '/assets/images/production-chup-anh-cuoi-main.png',
        '/assets/images/production-chup-anh-cuoi-thumb-1.png',
        '/assets/images/production-chup-anh-cuoi-thumb-2.png',
        '/assets/images/production-chup-anh-cuoi-thumb-3.png'
      ],
      description:
        'Dịch vụ bao gồm quay hình theo yêu cầu và bàn giao file gốc. Không bao gồm dịch vụ biên tập video. Quý khách vui lòng lưu ý.'
    },
    {
      title: 'Chụp ảnh concept',
      images: [
        '/assets/images/production-chup-anh-concept-main.png',
        '/assets/images/production-chup-anh-concept-thumb-1.png',
        '/assets/images/production-chup-anh-concept-thumb-2.png',
        '/assets/images/production-chup-anh-concept-thumb-3.png'
      ],
      description:
        'Dịch vụ bao gồm quay hình theo yêu cầu và bàn giao file gốc. Không bao gồm dịch vụ biên tập video. Quý khách vui lòng lưu ý.'
    }
  ]
}

function Service() {
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedSubService, setSelectedSubService] = useState<string | null>(null)
  const [minBudget, setMinBudget] = useState<number>(1000000)
  const [maxBudget, setMaxBudget] = useState<number>(100000000)
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
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('Cả ngày(8-10 tiếng)')
  const [conceptOptions, setConceptOptions] = useState<string[]>(['Chưa có', 'Đã có', 'Đang hoàn thiện, cần hỗ trợ'])
  const [weekDays, setWeekDays] = useState<string[]>(['Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'CN'])
  const [monthNames, setMonthNames] = useState<string[]>([
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12'
  ])

  const serviceOptions = selectedService ? serviceOptionsByService[selectedService] ?? [] : []
  const selectedProjectOption = serviceOptions.find((option) => option.title === selectedProject) ?? serviceOptions[0] ?? null
  const galleryMainImage = selectedProjectOption?.images[0] || defaultGalleryImages[0]
  const galleryThumbnails = selectedProjectOption ? selectedProjectOption.images.slice(1) : defaultGalleryImages.slice(1)
  const selectedDurationLabel = selectedDuration.split('(')[0].trim()

  useEffect(() => {
    bookingApi
      .getBookedDates(currentYear, currentMonth + 1)
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
    setSelectedDate(null)
  }, [currentMonth, currentYear])

  useEffect(() => {
    contentApi
      .getServiceConfig()
      .then((res) => {
        if (!res?.success) {
          return
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

  useEffect(() => {
    if (!selectedService) {
      return
    }

    const nextOptions = serviceOptionsByService[selectedService] ?? []

    if (nextOptions.length === 0) {
      setSelectedProject('')
      return
    }

    if (!nextOptions.some((option) => option.title === selectedProject)) {
      setSelectedProject(nextOptions[0].title)
      return
    }

  }, [selectedProject, selectedProjectOption, selectedService])

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
    if (serviceId === 'rental-house') {
      navigate('/equipment')
      return
    }

    setSelectedService(serviceId)
    setSelectedSubService(null)
    setSelectedConcept(null)
    setSelectedNextStep(null)
    setShowPhoneForm(false)
    setSelectedDate(null)
  }

  const handleMainServiceConfirm = () => {
    if (!selectedProjectOption) {
      return
    }

    if (selectedProjectOption.requiresDuration) {
      setSelectedSubService(`${selectedProjectOption.title} - ${selectedDuration}`)
      return
    }

    setSelectedSubService(selectedProjectOption.title)
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
      projectType: selectedProjectOption?.title || selectedProject,
      duration: selectedProjectOption?.requiresDuration ? selectedDuration : null,
      budget: { min: minBudget, max: maxBudget },
      conceptStatus: selectedConcept,
      bookingDate: {
        day: selectedDate,
        month: currentMonth + 1,
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
    const firstDay = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days: Array<number | null> = []

    for (let index = 0; index < firstDay; index += 1) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day)
    }

    return days
  }

  return (
    <>
      <div className="homepage">
        <Navigation />

        <section className="service-page">
          <div className="service-content">
            <h1 className="service-title">
              Choose your
              <br />
              best idea!
            </h1>
            <p className="service-subtitle">Let&apos;s we shape your story ✨</p>

            <div className="service-container">
              {showPhoneForm ? (
                <>
                  <button className="service-back-button" onClick={handleBackClick}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">Vui lòng nhập số điện thoại của bạn!</h3>

                  <div className="phone-input-container">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">Khi nào dự án của bạn bắt đầu?</h3>

                  <div className="calendar-container">
                    <div className="calendar-month-nav">
                      <button className="calendar-month-nav-button" onClick={handlePrevMonth}>
                        &lt;
                      </button>
                      <strong className="calendar-month-label">
                        {monthNames[currentMonth]} {currentYear}
                      </strong>
                      <button className="calendar-month-nav-button" onClick={handleNextMonth}>
                        &gt;
                      </button>
                    </div>

                    <div className="calendar-header">
                      {weekDays.map((day) => (
                        <div key={day} className="calendar-weekday">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="calendar-grid">
                      {getDaysInMonth().map((day, index) => {
                        if (day === null) {
                          return <div key={`empty-${index}`} className="calendar-day empty"></div>
                        }

                        const isBooked = bookedDates.includes(day)
                        const isDisabledPast = isPastDate(day)
                        const isSelected = selectedDate === day

                        return (
                          <div
                            key={`${currentMonth}-${currentYear}-${day}`}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">Bạn đã có concept/kịch bản chưa?</h3>

                  <div className="service-cards">
                    {conceptOptions.map((option) => (
                      <div key={option} className="service-card" onClick={() => handleConceptClick(option)}>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>
                  <h3 className="service-detail-title">Ngân sách của bạn là bao nhiêu?</h3>

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

                      <div className="budget-thumb-label budget-thumb-label-min" style={{ left: `${getMinPercentage()}%` }}>
                        <div className="budget-thumb-box">{formatCurrency(minBudget)} đ</div>
                      </div>
                      <div className="budget-thumb-label budget-thumb-label-max" style={{ left: `${getMaxPercentage()}%` }}>
                        <div className="budget-thumb-box">{formatCurrency(maxBudget)} đ</div>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="service-layout-container">
                    <div className="service-sidebar-card">
                      <h2 className="service-sidebar-title">Lựa chọn nhu cầu của bạn.</h2>
                      {serviceOptions.map((option) => (
                        <div
                          key={option.title}
                          className={`service-option-btn ${selectedProject === option.title ? 'active' : ''}`}
                          onClick={() => setSelectedProject(option.title)}
                        >
                          {option.title}
                        </div>
                      ))}
                    </div>

                    <div className="service-detail-area">
                      <div className="detail-gallery">
                        <img
                          src={galleryMainImage}
                          alt={selectedProjectOption?.title || 'Main view'}
                          className="gallery-main-img"
                          onError={(event) => {
                            ;(event.target as HTMLImageElement).src = defaultGalleryImages[0]
                          }}
                        />

                        <div className="gallery-thumbnails">
                          {galleryThumbnails.map((img, index) => (
                            <img
                              key={img}
                              src={img}
                              alt={`${selectedProjectOption?.title || 'Thumbnail'} ${index + 1}`}
                              className="gallery-thumb"
                              onError={(event) => {
                                ;(event.target as HTMLImageElement).src =
                                  defaultGalleryImages[(index + 1) % defaultGalleryImages.length]
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {selectedProjectOption?.description && (
                        <div className="detail-description">{selectedProjectOption.description}</div>
                      )}

                      {selectedProjectOption?.requiresDuration && (
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

                      {serviceOptions.length === 0 && (
                        <div className="detail-description">Nội dung dịch vụ đang được cập nhật.</div>
                      )}
                    </div>
                  </div>

                  <div className="action-btn-container">
                    <button
                      className="select-service-action-btn"
                      onClick={handleMainServiceConfirm}
                      disabled={!selectedProjectOption}
                    >
                      {selectedProjectOption
                        ? selectedProjectOption.requiresDuration
                          ? `${selectedProjectOption.title} - ${selectedDurationLabel}`
                          : selectedProjectOption.title
                        : 'Đang cập nhật'}
                    </button>
                  </div>

                  <p className="service-footer-text" style={{ textAlign: 'center', marginTop: '30px' }}>
                    Có áp dụng giới hạn về số lượng. Truy cập <span style={{ textDecoration: 'underline' }}>Chính sách của chúng tôi</span> để xem điều khoản và điều kiện đầy đủ.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="service-heading">Lựa chọn nhu cầu của bạn.</h2>
                  <p className="service-description">Chúng tôi sẽ giúp bạn đưa ra phương án phù hợp nhất.</p>

                  <div className="service-cards">
                    <div className="service-card" onClick={() => handleCardClick('production-house')}>
                      <h3 className="service-card-title outdoor-studio">Outdoor Studio</h3>
                    </div>

                    <div className="service-card" onClick={() => handleCardClick('outdoor-studio')}>
                      <h3 className="service-card-title production-house">Production House</h3>
                    </div>

                    <div className="service-card" onClick={() => handleCardClick('rental-house')}>
                      <h3 className="service-card-title rental-house">Rental House</h3>
                    </div>
                  </div>

                  <p className="service-footer-text">
                    Có áp dụng giới hạn về số lượng. Truy cập <span style={{ textDecoration: 'underline' }}>Chính sách của chúng tôi</span> để xem điều khoản và điều kiện đầy đủ.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleCloseModal}>
          <div className="success-modal" onClick={(event) => event.stopPropagation()}>
            <p className="success-modal-text">
              Yêu cầu của bạn đã được gửi đi!
              <br />
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
