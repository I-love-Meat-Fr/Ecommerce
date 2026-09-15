namespace Ecommer.Api.Models;

/// <summary>
/// Outcome of <c>CategoryService.UpdateAsync</c>. Distinguishes
/// "id did not match" (404) from "name/slug collides with another
/// category" (409). Without this distinction the unique index
/// <c>ux_categories_name</c> would surface as 500.
/// </summary>
public enum CategoryUpdateResult
{
    Updated,
    NotFound,
    DuplicateName,
}