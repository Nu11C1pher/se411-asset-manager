package edu.se411.inventory;
import jakarta.validation.constraints.*;
public record Asset(
 @NotBlank @Size(max=120) @Pattern(regexp="[A-Za-z0-9_-]+",message="ID may contain letters, numbers, underscores and hyphens") String id,
 @NotBlank @Size(max=120) String name,
 @NotBlank @Size(max=120) String brand,
 @NotNull @Size(max=120) String assignee,
 @NotBlank @Size(max=120) String location,
 @NotNull @Pattern(regexp="Available|Assigned|Maintenance|Retired") String status,
 @NotNull String purchased) {
 public Asset normalized() { return new Asset(id.trim().toUpperCase(java.util.Locale.ROOT),name.trim(),brand.trim(),assignee.trim(),location.trim(),status,purchased); }
}
