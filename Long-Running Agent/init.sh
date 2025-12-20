#!/bin/bash
# ============================================================================
# init.sh - Script สำหรับ setup environment
# ============================================================================
# Script นี้จะถูกเรียกโดย Coding Agent ทุกครั้งที่เริ่ม session ใหม่
# เพื่อให้แน่ใจว่า environment พร้อมทำงาน

set -e  # หยุดทันทีถ้ามี error

echo "============================================"
echo "  🚀 Initializing Development Environment"
echo "============================================"
echo ""

# 1. ตรวจสอบว่าอยู่ใน project directory หรือไม่
PROJECT_DIR="$(dirname "$0")"
cd "$PROJECT_DIR"
echo "📁 Working directory: $(pwd)"
echo ""

# 2. ตรวจสอบ .NET SDK
echo "🔍 Checking .NET SDK..."
if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    echo "   ✅ .NET SDK version: $DOTNET_VERSION"
else
    echo "   ❌ .NET SDK not found! Please install .NET 8 SDK"
    exit 1
fi
echo ""

# 3. ตรวจสอบว่ามี TodoApp project หรือยัง
echo "🔍 Checking project structure..."
if [ -d "src/TodoApp" ]; then
    echo "   ✅ TodoApp project exists"
    
    # Restore packages
    echo "   📦 Restoring packages..."
    cd src/TodoApp
    dotnet restore --quiet
    echo "   ✅ Packages restored"
    
    # Build project
    echo "   🔨 Building project..."
    if dotnet build --quiet --no-restore; then
        echo "   ✅ Build successful"
    else
        echo "   ❌ Build failed! Check the code and fix errors"
        exit 1
    fi
    
    # Run development server (background)
    echo "   🌐 Starting development server..."
    dotnet run --no-build &
    SERVER_PID=$!
    echo "   ✅ Server started (PID: $SERVER_PID)"
    
    # Wait for server to be ready
    echo "   ⏳ Waiting for server to be ready..."
    sleep 3
    
    # Basic health check
    echo "   🔍 Running health check..."
    if curl -s http://localhost:5000/api/todos > /dev/null 2>&1; then
        echo "   ✅ API is responding"
    else
        echo "   ⚠️  API might not be ready yet (this is OK for new setup)"
    fi
    
    cd ../..
else
    echo "   ⚠️  TodoApp project not found"
    echo "   📝 Run Feature #1 first to create the project"
fi
echo ""

# 4. แสดง Git status
echo "📊 Git Status:"
if [ -d ".git" ]; then
    echo "   Last 5 commits:"
    git log --oneline -5 2>/dev/null || echo "   No commits yet"
    echo ""
    echo "   Modified files:"
    git status --short 2>/dev/null || echo "   No changes"
else
    echo "   ⚠️  Git not initialized"
fi
echo ""

# 5. แสดง Feature Progress
echo "📋 Feature Progress:"
if [ -f "feature_list.json" ]; then
    TOTAL=$(grep -c '"id":' feature_list.json)
    PASSED=$(grep -c '"passes": true' feature_list.json || echo "0")
    echo "   Total: $TOTAL features"
    echo "   Passed: $PASSED"
    echo "   Remaining: $((TOTAL - PASSED))"
else
    echo "   ⚠️  feature_list.json not found"
fi
echo ""

echo "============================================"
echo "  ✅ Environment Ready!"
echo "============================================"
echo ""
echo "📖 Next Steps:"
echo "   1. Read claude-progress.txt for context"
echo "   2. Check feature_list.json for next task"
echo "   3. Make incremental progress on ONE feature"
echo "   4. Test thoroughly before marking as passed"
echo "   5. Commit changes and update progress log"
echo ""
