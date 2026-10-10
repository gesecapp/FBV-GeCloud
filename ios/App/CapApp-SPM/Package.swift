// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.0"),
        .package(name: "CapacitorCamera", path: "../../../node_modules/.pnpm/@capacitor+camera@8.2.0_patch_hash=9f6101d2003f5175dcde9040c93c0a9af0c77b957635801263d7_0ccf698ba63f447d2958dcef769ae7e7/node_modules/@capacitor/camera"),
        .package(name: "CapgoCameraPreview", path: "../../../node_modules/.pnpm/@capgo+camera-preview@8.4.4_patch_hash=8d32ae42b935eb3784c98eb505c82509a9ff16c7ee2b13e4_925b35e52fa8038b805fa98350f6a552/node_modules/@capgo/camera-preview")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapgoCameraPreview", package: "CapgoCameraPreview")
            ]
        )
    ]
)
