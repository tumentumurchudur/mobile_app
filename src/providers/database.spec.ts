import { DatabaseProvider } from "./database";
import { fireBaseConfig } from "../configs";

describe("app/providers/database", () => {
  const authProviderMock: any = {};
  const httpClientMock: any = {};
  const dbProvider = new DatabaseProvider(authProviderMock, httpClientMock);

  describe("getOrgPathForUser()", () => {
    it("returns org path", () => {
      const userRef: any = {
        child: function(uid) {
          return this;
        },
        once: function(value) {
          return Promise.resolve({ val: () => {
            return { orgs: { path: "100" } };
          }});
        }
      };
      const ref = spyOn(dbProvider as any, "dbRef").and.returnValue(userRef);

      dbProvider.getOrgPathForUser("id").subscribe(data => {
        expect(data).toEqual("100");
      });
      expect(ref).toHaveBeenCalled();
    });

    it("returns org path from array", () => {
      const userRef: any = {
        child: function(uid) {
          return this;
        },
        once: function(value) {
          return Promise.resolve({ val: () => {
            return { orgs: [{ path: "bar" }] };
          }});
        }
      };
      const ref = spyOn(dbProvider as any, "dbRef").and.returnValue(userRef);

      dbProvider.getOrgPathForUser("id").subscribe(data => {
        expect(data).toEqual("bar");
      });
      expect(ref).toHaveBeenCalled();
    });
  });
});
