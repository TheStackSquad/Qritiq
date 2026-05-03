//server/pkg/services/cloudinary/cloudinary.go

package cloudinary

import (
	"context"
	"errors"
	"fmt"
	
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/admin"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// Client wraps the Cloudinary SDK instance.
type Client struct {
	cld *cloudinary.Cloudinary
}

// New creates a Cloudinary client from environment variables.
func New() (*Client, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return nil, errors.New("cloudinary: missing required env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)")
	}

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, fmt.Errorf("cloudinary: failed to init client: %w", err)
	}

	return &Client{cld: cld}, nil
}

// UploadResult holds the response fields we care about.
type UploadResult struct {
	PublicID  string `json:"public_id"`
	SecureURL string `json:"secure_url"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	Format    string `json:"format"`
	Bytes     int    `json:"bytes"`
}

// UploadFile uploads a multipart file to the given Cloudinary folder.
// Allowed formats are enforced server-side.
func (c *Client) UploadFile(ctx context.Context, file multipart.File, folder string) (*UploadResult, error) {
	allowedFormats := []string{
		"jpg", "jpeg", "png", "webp", "avif",
		"mp4", "webm", "mov",
		"mp3", "aac", "ogg", "wav",
	}
params := uploader.UploadParams{
    Folder:         folder,
    AllowedFormats: allowedFormats,
}

	resp, err := c.cld.Upload.Upload(ctx, file, params)
	if err != nil {
		return nil, fmt.Errorf("cloudinary: upload failed: %w", err)
	}

	return &UploadResult{
		PublicID:  resp.PublicID,
		SecureURL: resp.SecureURL,
		Width:     resp.Width,
		Height:    resp.Height,
		Format:    resp.Format,
		Bytes:     resp.Bytes,
	}, nil
}

// DeleteFile permanently removes an asset by its public_id.
func (c *Client) DeleteFile(ctx context.Context, publicID string) error {
	_, err := c.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID:   publicID,
		Invalidate: api.Bool(true), // purge from CDN cache too
	})
	if err != nil {
		return fmt.Errorf("cloudinary: delete failed for %q: %w", publicID, err)
	}
	return nil
}

// ListFolder returns all assets under a given folder path.
func (c *Client) ListFolder(ctx context.Context, folder string) ([]string, error) {
	resp, err := c.cld.Admin.Assets(ctx, admin.AssetsParams{
		Prefix: folder,
	})
	if err != nil {
		return nil, fmt.Errorf("cloudinary: list failed for folder %q: %w", folder, err)
	}

	ids := make([]string, 0, len(resp.Assets))
	for _, a := range resp.Assets {
		ids = append(ids, a.PublicID)
	}
	return ids, nil
}