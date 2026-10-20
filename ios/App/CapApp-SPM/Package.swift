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
        .package(name: "CapacitorCamera", path: "../../../node_modules/.pnpm/@capacitor+camera@8.2.5_patch_hash=316244d2d4309b4d94a24b5a957d19b8e36beb5ee01f0b09a37c_aa184cee05677226f5e6907e7cd517ee/node_modules/@capacitor/camera"),
        .package(name: "CapgoCameraPreview", path: "../../../node_modules/.pnpm/@capgo+camera-preview@8.12.3_patch_hash=82819eabb4736efffa11f518f5cd84193d3a61ae4ffb7fd_101f322842c916e3e8f34070b04d23cf/node_modules/@capgo/camera-preview")
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
