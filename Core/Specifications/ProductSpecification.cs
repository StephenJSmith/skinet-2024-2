using Core.Entities;

namespace Core.Specifications;

public class ProductSpecification : BaseSpecfication<Product>
{
  public ProductSpecification(ProductSpecParams specParams) : base(x =>
    (string.IsNullOrWhiteSpace(specParams.Search) || x.Name.ToLower().Contains(specParams.Search))
    && (!specParams.Brands.Any() || specParams.Brands.Contains(x.Brand))
    && (!specParams.Types.Any() || specParams.Types.Contains(x.Type)))
  {
    var skip = (specParams.PageIndex - 1) * specParams.PageSize;
    var take = specParams.PageSize;
    ApplyPaging(skip, take);

    switch (specParams.Sort)
    {
      case "priceAsc":
        AddOrderBy(x => x.Price);
        break;

      case "priceDesc":
        AddOrderByDescending(x => x.Price);
        break;

      default:
        AddOrderBy(x => x.Name);
        break;
    }
   }
}
