# CareOne security headers.
#
# Included in the server block AND re-included in every location that defines
# its own add_header — nginx DROPS all inherited add_header directives the
# moment a nested block adds one of its own. Keep the includes in sync.
#
# Strict-Transport-Security is deliberately absent: TLS is terminated at the
# edge proxy, this container only ever speaks plain HTTP, and the edge vhost
# (deploy/edge/careone-edge.conf) is what sets HSTS.
#
# Origins below map to real dependencies:
#   fonts.googleapis.com, fonts.gstatic.com -> Poppins + Nunito Sans in client/index.html
#   res.cloudinary.com                      -> gallery images
#   img-src https:                          -> Cloudinary delivery domains
add_header X-Frame-Options        "SAMEORIGIN"                      always;
add_header X-Content-Type-Options "nosniff"                         always;
add_header Referrer-Policy        "strict-origin-when-cross-origin" always;
add_header Permissions-Policy     "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';" always;
