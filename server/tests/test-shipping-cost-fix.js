// DEPRECATED TEST - See BUG_FIX_SHIPPING_EMAIL.md for actual fix
//
// This test was created based on an incorrect diagnosis.
// The actual bug was in stripe.routes.js (double conversion), 
// not in the shipping service.
//
// The shipping service was working correctly and did not need
// the cents-to-dollars conversion that this test validates.

console.log('⚠️  This test is deprecated.');
console.log('The shipping cost bug was actually in stripe.routes.js');
console.log('See: /docs/BUG_FIX_SHIPPING_EMAIL.md');
