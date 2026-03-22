# PowerShell script to zip & deploy multiple Lambda functions
$roleArn = "arn:aws:iam::851725171907:role/viteLambdaRole"
cd amplify\backend\function

Get-ChildItem -Directory | ForEach-Object {
    $functionName = $_.Name
    $zipFile = "$functionName.zip"

    Write-Host "Zipping $functionName..."
    Compress-Archive -Path "$($_.FullName)\*" -DestinationPath $zipFile -Force

    # Check if function exists
    $exists = aws lambda list-functions | Select-String $functionName
    if ($exists) {
        Write-Host "Updating $functionName..."
        aws lambda update-function-code --function-name $functionName --zip-file fileb://$zipFile
    } else {
        Write-Host "Creating $functionName..."
        aws lambda create-function `
            --function-name $functionName `
            --runtime nodejs18.x `
            --handler handler.handler `
            --zip-file fileb://$zipFile `
            --role $roleArn
    }
}
Write-Host "All Lambdas deployed successfully!"