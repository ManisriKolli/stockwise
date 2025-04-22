import { NextResponse } from 'next/server';
 
export default authMiddleware({
  publicRoutes: ["/", "/api(.*)"]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};