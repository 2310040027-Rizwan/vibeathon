import { useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function MiniMap({ items = [], height = '260px' }) {
  const center = useMemo(() => {
    const withGeo = items.filter((i) => i.geo && Array.isArray(i.geo.coordinates))
    if (withGeo.length) {
      const [lng, lat] = withGeo[0].geo.coordinates
      return [lat, lng]
    }
    // Default center (KLH vicinity as placeholder)
    return [17.4933, 78.3915]
  }, [items])

  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden" bg="white">
      <MapContainer center={center} zoom={15} style={{ height }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((i) => {
          if (!i.geo || !Array.isArray(i.geo.coordinates)) return null
          const [lng, lat] = i.geo.coordinates
          return (
            <Marker key={i._id} position={[lat, lng]} icon={defaultIcon}>
              <Popup>
                <strong>{i.itemName}</strong>
                {i.location ? <div>Location: {i.location}</div> : null}
                {i.status ? <div>Status: {i.status}</div> : null}
                {i.lostAt ? <div>When: {new Date(i.lostAt).toLocaleString()}</div> : null}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </Box>
  )
}



