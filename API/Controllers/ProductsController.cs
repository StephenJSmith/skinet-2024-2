using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.Specifications;
using Infrastructure.Data;

namespace API.Controllers;

public class ProductsController(UnitOfWork unit) : BaseApiController
{
  [HttpGet]
  public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
    [FromQuery]ProductSpecParams specParams)
  {
    var spec = new ProductSpecification(specParams);
    var actionResult = await CreatePagedResult(
      unit.Repository<Product>(), spec, specParams.PageIndex, specParams.PageSize);

    return actionResult;
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<Product>> GetProduct(int id)
  {
    var product = await unit.Repository<Product>().GetByIdAsync(id);
    if (product == null) return NotFound();

    return product;
  }

  [HttpPost]
  public async Task<ActionResult<Product>> CreateProduct(Product product)
  {
    unit.Repository<Product>().Add(product);
    if (!await unit.Complete())
      return BadRequest("Problem creating this product");

    return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
  }

  [HttpPut("{id}")]
  public async Task<ActionResult> UpdateProduct(int id, Product product)
  {
    if (product.Id != id || !unit.Repository<Product>().Exists(id))
      return BadRequest("Cannot update this product");

    unit.Repository<Product>().Update(product);
    if (!await unit.Complete())
      return BadRequest("Problem updating the product");

    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<ActionResult> DeleteProduct(int id)
  {
    var product = await unit.Repository<Product>().GetByIdAsync(id);
    if (product == null) return NotFound();

    unit.Repository<Product>().Remove(product);
    if (!await unit.Complete())
      return BadRequest("Problem deleting the product");

    return NoContent();
  }

  [HttpGet("brands")]
  public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
  {
    var spec = new BrandListSpecification();
    var brands = await unit.Repository<Product>().ListAsync(spec);

    return Ok(brands);
  }
  
  [HttpGet("types")]
  public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
  {
    var spec = new TypeListSpecification();
    var types = await unit.Repository<Product>().ListAsync(spec);

    return Ok(types);
  }
}