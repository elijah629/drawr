{ pkgs }: {
    deps = [
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodejs-16_x
		pkgs.unzip

        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}
