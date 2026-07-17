import { withApiError } from "@/lib/http/errors";
import { searchParamsObject } from "@/lib/http/server";
import { helloInput, userService } from "@/service/user";

export async function GET(request: Request) {
  return withApiError(async () => {
    const input = helloInput.parse(searchParamsObject(request));
    return Response.json(await userService.getHello(input));
  });
}
