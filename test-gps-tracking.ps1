# GPS Tracking Test Script
# Simulates Traccar Client sending GPS data to the API

Write-Host "🚀 BTS GPS Tracking Test" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3001/api/gps"

# Test devices with Turkish city coordinates
$testDevices = @(
    @{
        id = "test-worker-001"
        name = "Ahmet Yılmaz"
        lat = 41.0082
        lon = 28.9784
        city = "İstanbul"
    },
    @{
        id = "test-worker-002"
        name = "Mehmet Demir"
        lat = 39.9334
        lon = 32.8597
        city = "Ankara"
    },
    @{
        id = "test-worker-003"
        name = "Ayşe Kaya"
        lat = 38.4192
        lon = 27.1287
        city = "İzmir"
    }
)

Write-Host "📍 Testing GPS API with $($testDevices.Count) virtual workers..." -ForegroundColor Yellow
Write-Host ""

foreach ($device in $testDevices) {
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    
    # Randomize speed and battery
    $speed = Get-Random -Minimum 0 -Maximum 60
    $bearing = Get-Random -Minimum 0 -Maximum 360
    $battery = Get-Random -Minimum 20 -Maximum 100
    $accuracy = Get-Random -Minimum 5 -Maximum 15
    $altitude = Get-Random -Minimum 50 -Maximum 200
    
    # Add slight random movement to location
    $latOffset = (Get-Random -Minimum -10 -Maximum 10) / 10000
    $lonOffset = (Get-Random -Minimum -10 -Maximum 10) / 10000
    $lat = $device.lat + $latOffset
    $lon = $device.lon + $lonOffset
    
    $url = "$baseUrl" + "?id=$($device.id)" + "&lat=$lat" + "&lon=$lon" + "&timestamp=$timestamp" + "&speed=$speed" + "&bearing=$bearing" + "&altitude=$altitude" + "&accuracy=$accuracy" + "&batt=$battery"
    
    Write-Host "📡 Sending GPS data for: $($device.name) ($($device.city))" -ForegroundColor Green
    Write-Host "   Device ID: $($device.id)" -ForegroundColor Gray
    Write-Host "   Location: $lat, $lon" -ForegroundColor Gray
    Write-Host "   Speed: $speed m/s | Battery: $battery%" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "   ✅ SUCCESS - Location saved (ID: $($response.location_id))" -ForegroundColor Green
            if (-not $response.user_mapped) {
                Write-Host "   ⚠️  Warning: Device not mapped to any user" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ FAILED - $($response.error)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

Write-Host "✅ Test completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:3001/admin in your browser" -ForegroundColor Gray
Write-Host "   2. Login as admin" -ForegroundColor Gray
Write-Host "   3. Check the Live GPS Tracking Map on the dashboard" -ForegroundColor Gray
Write-Host "   4. You should see the test workers on the map" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 To simulate continuous tracking, run this script multiple times" -ForegroundColor Cyan
