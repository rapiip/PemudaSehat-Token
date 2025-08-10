(impl-trait .sip-010-trait.sip-010-trait)

;; Definisikan token
(define-fungible-token psht-token)

;; Storage
(define-data-var owner principal tx-sender)        ;; owner di-set saat deployer meng-deploy kontrak
(define-map minters { who: principal } { ok: bool }) ;; opsional: izinkan beberapa akun sebagai minter

;; Konstanta error
(define-constant ERR-NOT-OWNER (err u100))
(define-constant ERR-NOT-MINTER (err u101))
(define-constant ERR-NOT-SENDER (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))

;; Metadata
(define-constant token-name "PemudaSehat Token")
(define-constant token-symbol "PSHT")
(define-constant token-decimals u6)
(define-constant token-uri u"https://workshop.blockdev.id/token.json")

;; Helpers
(define-read-only (is-owner (p principal)) (is-eq p (var-get owner)))
(define-read-only (is-minter (p principal)) (is-some (map-get? minters { who: p })))

;; SIP-010 views
(define-read-only (get-name) (ok token-name))
(define-read-only (get-symbol) (ok token-symbol))
(define-read-only (get-decimals) (ok token-decimals))
(define-read-only (get-balance (user principal)) (ok (ft-get-balance psht-token user)))
(define-read-only (get-total-supply) (ok (ft-get-supply psht-token)))
(define-read-only (get-token-uri) (ok (some token-uri)))

;; Transfer standar SIP-010
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (if (not (> amount u0)) ERR-INVALID-AMOUNT
    (if (not (is-eq from tx-sender)) ERR-NOT-SENDER
      (ft-transfer? psht-token amount from to)
    )
  )
)

;; Admin ops
(define-public (set-owner (new-owner principal))
  (if (not (is-owner tx-sender)) ERR-NOT-OWNER
    (begin (var-set owner new-owner) (ok true))
  )
)

(define-public (set-minter (who principal) (allowed bool))
  (if (not (is-owner tx-sender)) ERR-NOT-OWNER
    (begin
      (if allowed
        (map-set minters { who: who } { ok: true })
        (map-delete minters { who: who })
      )
      (ok true)
    )
  )
)

;; Mint: hanya owner atau minter terotorisasi
(define-public (mint (amount uint) (to principal))
  (if (not (> amount u0)) ERR-INVALID-AMOUNT
    (if (or (is-owner tx-sender) (is-minter tx-sender))
      (ft-mint? psht-token amount to)
      ERR-NOT-MINTER
    )
  )
)

;; Burn: hanya oleh pemilik saldo sendiri
(define-public (burn (amount uint) (from principal))
  (if (not (> amount u0)) ERR-INVALID-AMOUNT
    (if (not (is-eq from tx-sender)) ERR-NOT-SENDER
      (ft-burn? psht-token amount from)
    )
  )
)
