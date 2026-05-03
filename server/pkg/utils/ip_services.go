package utils

type IPService struct{}

func NewIPService() *IPService {
	return &IPService{}
}

// GetLocation is called by the service layer. 
// For now, we'll return placeholders. In production, 
// you'd use a GeoIP provider like MaxMind or ipapi.
func (s *IPService) GetLocation(ip string) (city, state string) {
	if ip == "127.0.0.1" || ip == "::1" {
		return "Localhost", "System"
	}
	return "Unknown City", "Unknown State"
}
