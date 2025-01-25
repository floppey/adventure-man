import { Projectile } from "../models/projectiles/Projectile";

export const getProjectileCollisions = (
  projectile: Projectile,
  projectiles: Projectile[]
): Projectile | null => {
  const corners = [
    projectile.hitbox.bottomLeft,
    projectile.hitbox.bottomRight,
    projectile.hitbox.topLeft,
    projectile.hitbox.topRight,
  ];

  const collisions = projectiles.filter((otherProjectile) => {
    if (otherProjectile.getId() === projectile.getId()) {
      return false;
    }
    const otherCorners = [
      otherProjectile.hitbox.bottomLeft,
      otherProjectile.hitbox.bottomRight,
      otherProjectile.hitbox.topLeft,
      otherProjectile.hitbox.topRight,
    ];

    return corners.some((corner) => {
      return otherCorners.some((otherCorner) => {
        return (
          corner.x >= otherCorner.x &&
          corner.x <= otherCorner.x + otherProjectile.getWidth() &&
          corner.y >= otherCorner.y &&
          corner.y <= otherCorner.y + otherProjectile.getHeight()
        );
      });
    });
  });

  return collisions?.[0] ?? null;
};
