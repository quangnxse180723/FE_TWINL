import { useState, useEffect } from 'react'

export interface Province {
  code: number
  name: string
}

export interface District {
  code: number
  name: string
}

export interface Ward {
  code: string
  name: string
}

export function useVNLocations(provinceId?: string, districtId?: string) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  // Fetch Provinces
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Error fetching provinces:', err))
  }, [])

  // Fetch Districts when provinceId changes
  useEffect(() => {
    if (provinceId) {
      fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || [])
        })
        .catch((err) => console.error('Error fetching districts:', err))
    } else {
      setDistricts([])
    }
  }, [provinceId])

  // Fetch Wards when districtId changes
  useEffect(() => {
    if (districtId) {
      fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          // Open API ward code can be integer or string, our DB uses string
          const formattedWards = (data.wards || []).map((w: any) => ({
            ...w,
            code: String(w.code),
          }))
          setWards(formattedWards)
        })
        .catch((err) => console.error('Error fetching wards:', err))
    } else {
      setWards([])
    }
  }, [districtId])

  return { provinces, districts, wards }
}
