using API.DTOs;
using API.Extensions;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AccountController(SignInManager<AppUser> signinManager) : BaseApiController
{
  [HttpPost("register")]
  public async Task<IActionResult> Register(RegisterDto registerDto)
  {
    var user = new AppUser
    {
      FirstName = registerDto.FirstName,
      LastName = registerDto.LastName,
      Email = registerDto.Email,
      UserName = registerDto.Email,
    };

    var result = await signinManager.UserManager.CreateAsync(user, registerDto.Password);
    if (!result.Succeeded)
    {
      foreach (var error in result.Errors)
      {
        ModelState.AddModelError(error.Code, error.Description);
      }

      return ValidationProblem();
    }
    ;

    return Ok();
  }

  [Authorize]
  [HttpPost("logout")]
  public async Task<ActionResult> Logout()
  {
    await signinManager.SignOutAsync();

    return NoContent();
  }

  [HttpGet("user-info")]
  public async Task<ActionResult> GetUserInfo()
  {
    if (User.Identity?.IsAuthenticated == false) return NoContent();

    var user = await signinManager.UserManager.GetUserByEmailWithAddress(User);

    return Ok(new
    {
      user.FirstName,
      user.LastName,
      user.Email,
      Address = user.Address?.ToDto()
    });
  }

  [HttpGet("auth-status")]
  public ActionResult GetAuthState()
  {
    return Ok(new { IsAuthenticated = User.Identity?.IsAuthenticated ?? false });
  }

  [Authorize]
  [HttpPost("address")]
  public async Task<ActionResult<AddressDto>> CreateOrUpdateAddress(AddressDto addressDto)
  {
    var user = await signinManager.UserManager.GetUserByEmailWithAddress(User);
    if (user.Address == null)
    {
      user.Address = addressDto.ToEntity();
    }
    else
    {
      user.Address.UpdateFromDto(addressDto);
    }

    var result = await signinManager.UserManager.UpdateAsync(user);
    if (!result.Succeeded) return BadRequest("Problem updating user address");

    return Ok(user.Address.ToDto());
  }
}
