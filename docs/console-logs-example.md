# Console Logs Example for Single Report Payment Flow

## Expected Console Output

When you press F12 and go to the Console tab, you should see logs like this:

### 1. Checkout Session Creation Logs

\`\`\`
🚀 === CREATE CHECKOUT SESSION START ===
📋 Request Details:
   - Price ID: price_1RdGtXD80D06ku9UWRTdDUHh
   - Test Mode Requested: true
   - Test Card Type: live
   - Timestamp: 2024-01-15T13:08:51.926Z

🔑 Stripe Key Configuration:
   - Using Test Key: ❌ NO
   - Using Live Key: ✅ YES
   - Key Prefix: sk_live_...

🚨 === LIVE MODE DETECTED ===
   ⚠️ You are using LIVE Stripe keys
   ⚠️ This will create REAL payment sessions
   ⚠️ Test cards (4242 4242 4242 4242) will NOT work
   ⚠️ Real payment methods will be required
   💡 For testing, consider using test keys (sk_test_...)
   🔄 Test mode requested but live keys detected
   🔄 Proceeding with live session creation

✅ Environment variables validated

🔍 Validating price ID with Stripe...
✅ Price validation successful:
   - ID: price_1RdGtXD80D06ku9UWRTdDUHh
   - Amount: 499 cents
   - Currency: usd
   - Type: one_time
   - Recurring: No
   - Live Mode: LIVE

🎯 Payment Flow Detection:
   - Price ID: price_1RdGtXD80D06ku9UWRTdDUHh
   - Is Subscription: ❌ NO
   - Is Single Report: ✅ YES
   - Stripe Price Type: one_time
   - Has Recurring Config: ❌ NO
   - Price Live Mode: LIVE

✅ Payment type validation passed

⚙️ Session Configuration:
   - Mode: payment
   - Purchase Type: single_report
   - Amount: 499 cents
   - Currency: usd

🔍 SINGLE REPORT FLOW VALIDATION:
   ✅ Expected Mode: 'payment' | Actual: payment
   ✅ Expected Type: 'single_report' | Actual: single_report
   ✅ Expected Amount: 499 cents | Actual: 499
   ✅ Expected Currency: 'usd' | Actual: usd
   ✅ Expected Stripe Type: 'one_time' | Actual: one_time
   🎉 SINGLE REPORT FLOW VALIDATION: ALL CHECKS PASSED!

🔴 Adding live mode configuration...
✅ Added payment intent data for single report

📋 Final session configuration:
   - Mode: payment
   - Success URL: https://your-domain.com/success?session_id={CHECKOUT_SESSION_ID}&type=single_report
   - Cancel URL: https://your-domain.com/test-payments?canceled=true
   - Metadata: {
       "priceId": "price_1RdGtXD80D06ku9UWRTdDUHh",
       "purchaseType": "single_report",
       "testMode": "true",
       "testCardType": "live",
       "amount": "499",
       "currency": "usd",
       "flow_validation": "single_report_validated",
       "stripe_mode": "live",
       "live_environment": "true",
       "live_timestamp": "2024-01-15T13:08:51.926Z",
       "warning": "real_payment_required"
     }
   - Payment Intent Data: {
       "metadata": {
         "product_type": "single_report",
         "usage_limit": "1",
         "test_card_type": "live",
         "flow_type": "one_time_payment",
         "validation_status": "passed",
         "payment_mode": "live"
       }
     }

🔄 Creating Stripe checkout session...

🎉 SESSION CREATED SUCCESSFULLY!
📊 Session Details:
   - Session ID: cs_live_b1HtzaWSIryl4Q6IdZUUJGsajmXNekJgeJ1efdPYeREhn2JbpF18Hmud8i
   - Session ID Type: LIVE
   - Checkout URL: https://checkout.stripe.com/c/pay/cs_live_b1HtzaWSIryl4Q6IdZUUJGsajmXNekJgeJ1efdPYeREhn2JbpF18Hmud8i#...
   - Mode: payment
   - Amount Total: 499 cents
   - Currency: usd
   - Status: open
   - Payment Status: unpaid
   - Live Mode: LIVE

🚨 === LIVE SESSION CREATED ===
   🔴 This is a LIVE Stripe session
   🔴 Real payment methods are required
   🔴 Test cards will be rejected
   🔴 Actual charges will be processed
   💡 Use a real credit card to complete payment
   💡 Or switch to test keys for testing

🔍 FINAL VALIDATION CHECKS:
   Single Report Validation Results:
   - Mode is 'payment': ✅ PASS
   - Amount is 499 cents: ✅ PASS
   - Currency is 'usd': ✅ PASS
   - Status is 'open': ✅ PASS
   - Metadata type correct: ✅ PASS
   🎯 OVERALL SINGLE REPORT VALIDATION: ✅ ALL PASSED!

✅ === CREATE CHECKOUT SESSION COMPLETE ===
\`\`\`

### 2. Test Page Response Logs

\`\`\`
🚀 === STARTING SINGLE REPORT TEST ===
📋 Test Parameters:
   - Plan: Single Report
   - Price ID: price_1RdGtXD80D06ku9UWRTdDUHh
   - Test Card Type: live
   - Test ID: Single Report-live-1705320531926
   - Timestamp: 2024-01-15T13:08:51.926Z

📡 Checkout API Response:
   - Status: 200
   - Status Text: OK

📊 Checkout Response Data:
   - Success: true
   - Session ID: cs_live_b1HtzaWSIryl4Q6IdZUUJGsajmXNekJgeJ1efdPYeREhn2JbpF18Hmud8i
   - Mode: payment
   - Amount: 499 cents
   - Currency: usd
   - Live Mode: true
   - Requires Real Payment: true

🚨 === LIVE MODE SESSION CREATED ===
   🔴 This session requires REAL payment methods
   🔴 Test cards (4242 4242 4242 4242) will NOT work
   🔴 Use a real credit card to complete payment
   💰 Actual charges will be processed
   💡 Consider using Stripe test keys for testing

✅ Checkout session created successfully!
🔗 Checkout URL: https://checkout.stripe.com/c/pay/cs_live_b1HtzaWSIryl4Q6IdZUUJGsajmXNekJgeJ1efdPYeREhn2JbpF18Hmud8i#...
💳 PAYMENT INSTRUCTIONS:
   1. Use a REAL credit card (not test cards)
   2. Enter valid billing information
   3. Actual payment will be processed
   4. You will be charged $4.99

🔴 Checkout URL is in LIVE mode - real payment required
🏁 Test initiation completed
\`\`\`

### 3. Session Verification Logs (After Payment)

\`\`\`
🎉 === SUCCESS PAGE LOADED ===
📋 URL Parameters:
   - Session ID: cs_live_b1HtzaWSIryl4Q6IdZUUJGsajmXNekJgeJ1efdPYeREhn2JbpF18Hmud8i
   - Type from URL: single_report
   - Full URL: https://yourdomain.com/success?session_id=cs_live_...&type=single_report
   - Timestamp: 2024-01-15T13:09:15.123Z

🔍 Starting session verification...
   - Calling API: /api/verify-session
   - Session ID: cs_live_b1HtzaWSIryl4Q6IdZUUJGsajmXNekJgeJ1efdPYeREhn2JbpF18Hmud8i

📡 API Response:
   - Status: 200
   - Status Text: OK

✅ Session verification successful!
📊 Session Data Received:
   - Plan: Single Report
   - Amount: $4.99
   - Purchase Type: single_report
   - Payment Flow: {
       mode: "payment",
       is_subscription: false,
       is_one_time: true,
       has_trial: false
     }
   - Test Mode: true

🔍 SINGLE REPORT FLOW VALIDATION ON SUCCESS PAGE:
   - URL type parameter: single_report
   - Session purchase_type: single_report
   - Session mode: payment
   - Is one-time payment: true
   - Amount: $4.99
   - Plan: Single Report

🎯 Single Report Flow Validation Results:
   Validation Checks:
   - URL type matches: ✅ PASS
   - Purchase type correct: ✅ PASS
   - Mode is 'payment': ✅ PASS
   - Is one-time payment: ✅ PASS
   - Amount is $4.99: ✅ PASS
   - Plan name correct: ✅ PASS
   - Not a subscription: ✅ PASS
   - No trial period: ✅ PASS
   🎯 OVERALL VALIDATION: ✅ ALL PASSED!

💳 Payment Details:
   - Payment ID: pi_3OaBC1D80D06ku9U1234567890
   - Status: succeeded
   - Amount: 499 cents
   - Currency: usd
   - Created: 2024-01-15T13:09:12.000Z

✅ Correctly no subscription details for Single Report

🏁 Session verification process completed
\`\`\`

## Key Indicators to Look For

### ✅ Success Indicators
- All validation checks show "✅ PASS"
- Session ID starts with "cs_test_" (not "cs_live_")
- Mode is consistently "payment"
- Amount is 499 cents / $4.99
- Live Mode shows "TEST" or false
- Overall validation shows "ALL PASSED!"

### ❌ Failure Indicators
- Any validation checks show "❌ FAIL"
- Session ID starts with "cs_live_" when testing
- Mode shows "subscription" instead of "payment"
- Amount is not 499 cents
- Live Mode shows "LIVE" or true when testing
- Error messages about key configuration

### 🚨 Critical Issues
- "Test mode requested but session created in LIVE mode!"
- "Using Live Key: ✅ YES" when testing
- Any Stripe errors about invalid configurations
- Broken checkout URLs or payment failures

## Troubleshooting

If you see issues:

1. **Live Mode in Test**: Check your Stripe keys are test keys (sk_test_...)
2. **Broken Checkout**: Verify price IDs exist in your Stripe account
3. **Amount Mismatch**: Confirm price is set to $4.99 in Stripe dashboard
4. **Mode Issues**: Ensure price type is "one_time" not "recurring"

## Key Differences from Test Mode

### Live Mode Indicators:
- ✅ Session ID starts with `cs_live_` (not `cs_test_`)
- ✅ Live Mode shows `true` (not `false`)
- ✅ Clear warnings about real payment requirements
- ✅ Instructions to use real credit cards
- ✅ Warnings that test cards will be rejected

### What This Means:
1. **Real Payments**: You will be charged actual money
2. **Test Cards Rejected**: 4242 4242 4242 4242 won't work
3. **Valid Cards Required**: Use real credit/debit cards
4. **Immediate Processing**: Charges are processed immediately
5. **No Refunds**: Unless manually processed through Stripe dashboard

### To Switch to Test Mode:
1. Change `STRIPE_SECRET_KEY` to start with `sk_test_`
2. Change `STRIPE_PUBLISHABLE_KEY` to start with `pk_test_`
3. Restart your application
4. Test cards will then work normally
