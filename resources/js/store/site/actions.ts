import { ActionContext } from "vuex";
import RootState from "../rootState";
import { SiteState } from "./stateInterface";
import SiteService from "@app/services/site/SiteService";

export default function(siteService: SiteService) {
  return {
    get: (context: ActionContext<SiteState, RootState>) => {
      return siteService.get().then(({ data }) => {
        context.commit("SET_SITES", data);
        if (!context.state.selectedSite && data[0]) {
          context.commit("SET_SELECTED_SITE", data[0]);
        }
        return data;
      });
    },
    show: (context: ActionContext<SiteState, RootState>, siteId) => {
      return siteService.show(siteId).then(({ data }) => {
        context.commit("SET_SITE", data);
        return data;
      });
    },
    create: (context: ActionContext<SiteState, RootState>, data) => {
      return siteService.store(data).then(({ data }) => {
        return data;
      });
    },
  };
}
