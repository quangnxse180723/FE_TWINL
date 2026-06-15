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
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) {
          const mapped = data.data.map((p: any) => ({
            code: Number(p.id),
            name: p.full_name
          }))
          setProvinces(mapped)
        }
      })
      .catch((err) => console.error('Error fetching provinces:', err))
  }, [])

  // Fetch Districts when provinceId changes
  useEffect(() => {
    if (provinceId) {
      // esgoo expects padded strings, e.g., '01'
      const pIdStr = String(provinceId).padStart(2, '0')
      fetch(`https://esgoo.net/api-tinhthanh/2/${pIdStr}.htm`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error === 0) {
            const mapped = data.data.map((d: any) => ({
              code: Number(d.id),
              name: d.full_name
            }))
            setDistricts(mapped)
          } else {
            setDistricts([])
          }
        })
        .catch((err) => {
          console.error('Error fetching districts:', err)
          setDistricts([])
        })
    } else {
      setDistricts([])
    }
  }, [provinceId])

  // Fetch Wards when districtId changes
  useEffect(() => {
    if (districtId) {
      const dIdStr = String(districtId).padStart(3, '0')
      fetch(`https://esgoo.net/api-tinhthanh/3/${dIdStr}.htm`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error === 0) {
            const mapped = data.data.map((w: any) => ({
              code: String(w.id),
              name: w.full_name
            }))
            setWards(mapped)
          } else {
            setWards([])
          }
        })
        .catch((err) => {
          console.error('Error fetching wards:', err)
          setWards([])
        })
    } else {
      setWards([])
    }
  }, [districtId])

  return { provinces, districts, wards }
}
