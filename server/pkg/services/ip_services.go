//server/pkg/services/ip_services.go

package services

import "github.com/qritiq/server/pkg/utils"

// IPService is the service-layer wrapper around the utils.IPService.
// Handlers and other services depend on this interface, not utils directly.
type IPService struct {
	resolver *utils.IPService
}

func NewIPService() *IPService {
	return &IPService{resolver: utils.NewIPService()}
}

// GetLocation returns (city, state) for a raw IP string.
func (s *IPService) GetLocation(ip string) (city, state string) {
	return s.resolver.GetLocation(ip)
}