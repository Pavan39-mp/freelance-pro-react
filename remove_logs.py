with open("src/pages/Login.jsx", "r") as f:
    content = f.read()
content = content.replace("console.log('AUTH USER in Login useEffect:', user);\n", "")
content = content.replace("toast.success('Welcome back!');\n        console.log('LOGIN SUCCESS', res);", "toast.success('Welcome back!');")
with open("src/pages/Login.jsx", "w") as f:
    f.write(content)

with open("src/components/auth/ProtectedRoute.jsx", "r") as f:
    content = f.read()
content = content.replace("    console.log('PROTECTED ROUTE', { path: window.location.pathname, user, loading, allowedRoles });\n", "")
with open("src/components/auth/ProtectedRoute.jsx", "w") as f:
    f.write(content)

with open("src/context/UserContext.jsx", "r") as f:
    content = f.read()
content = content.replace("console.log('LOAD USER SUCCESS, setting user:', res.data);\n        ", "")
with open("src/context/UserContext.jsx", "w") as f:
    f.write(content)
