// Mock UserContext & ProtectedRoute logic
function simulateProtectedRoute(user, allowedRoles, path) {
    if (!user) {
        return "Navigate to /login";
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'client') {
            return "Navigate to /client-dashboard";
        }
        if (user.role === 'freelancer') {
            return "Navigate to /dashboard";
        }
        return "Navigate to /login";
    }

    return `Render ${path}`;
}

const userClient = { role: 'client' };
const userFreelancer = { role: 'freelancer' };
const userNone = { role: undefined };

console.log("Client on /client-dashboard:", simulateProtectedRoute(userClient, ['client'], '/client-dashboard'));
console.log("Client on /dashboard:", simulateProtectedRoute(userClient, ['freelancer'], '/dashboard'));

console.log("Freelancer on /client-dashboard:", simulateProtectedRoute(userFreelancer, ['client'], '/client-dashboard'));
console.log("Freelancer on /dashboard:", simulateProtectedRoute(userFreelancer, ['freelancer'], '/dashboard'));

console.log("None on /dashboard:", simulateProtectedRoute(userNone, ['freelancer'], '/dashboard'));
